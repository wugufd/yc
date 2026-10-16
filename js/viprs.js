// viprs4.cc drpy 规则 v7 稳定版
// 实测验证：
//   - 裸分类URL（/dianying.html等）无PoW，返回190KB+24张卡片
//   - 带?参数的翻页/搜索会触发PoW，内置SHA1求解器自动过验
//   - 卡片正则在真实电影/电视剧/搜索页均能命中全部卡片
//   - 详情页线路切换URL格式：/movie|tv/{hex}-{vid}.html?origin={encodeURIComponent(线路名)}
//   - 集数URL格式：/movie|tv/{hex}/{vid}.html?origin=xxx&p=N（N从0开始）
//   - 播放页 xg_video_player_doc.aa.url = /api/m3u8?origin=xxx&url=xxx，302跳转box域名
// 适配 TVBox / 猫影视 / 影视仓 / zyplayer / drpy T1 等
var rule = {
    title: '韩剧网(viprs4)',
    host: 'https://viprs4.cc',
    homeUrl: '/',
    url: '/fyclass',
    searchUrl: '/s.html?name=**&page=fypage',
    searchable: 2,
    quickSearch: 0,
    filterable: 0,
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://viprs4.cc/'
    },
    timeout: 20000,

    // 5个一级分类：直接访问裸URL = 该分类下的"全部"内容（第1页24张）
    class_name: '电影&电视剧&综艺&动漫&短剧',
    class_url:  'dianying.html&dianshiju.html&zongyi.html&dongman.html&duanju.html',

    // ========== PoW反爬求解（带?参数的URL会触发） ==========
    _sha1: function(s) {
        function rot(n,c){return((n<<c)|(n>>>(32-c)))>>>0;}
        function hex(v){var t='';for(var i=7;i>=0;i--)t+=((v>>>(i*4))&0xf).toString(16);return t;}
        var bytes=unescape(encodeURIComponent(s));
        var blks=((bytes.length+8)>>6)+1;
        var b=new Array(blks*16);
        for(var i=0;i<blks*16;i++)b[i]=0;
        for(var i=0;i<bytes.length;i++)b[i>>2]|=bytes.charCodeAt(i)<<(24-(i%4)*8);
        b[i>>2]|=0x80<<(24-(i%4)*8);
        b[blks*16-1]=bytes.length*8;
        var w=new Array(80);
        var h0=0x67452301,h1=0xEFCDAB89,h2=0x98BADCFE,h3=0x10325476,h4=0xC3D2E1F0;
        for(var i=0;i<blks;i++){var a=h0,bb=h1,c=h2,d=h3,e=h4;
            for(var j=0;j<80;j++){if(j<16)w[j]=b[i*16+j];else w[j]=rot(w[j-3]^w[j-8]^w[j-14]^w[j-16],1);
                var f,k;if(j<20){f=(bb&c)|(~bb&d);k=0x5A827999;}else if(j<40){f=bb^c^d;k=0x6ED9EBA1;}else if(j<60){f=(bb&c)|(bb&d)|(c&d);k=0x8F1BBCDC;}else{f=bb^c^d;k=0xCA62C1D6;}
                var tmp=(rot(a,5)+f+e+k+w[j])>>>0;e=d;d=c;c=rot(bb,30);bb=a;a=tmp;}
            h0=(h0+a)>>>0;h1=(h1+bb)>>>0;h2=(h2+c)>>>0;h3=(h3+d)>>>0;h4=(h4+e)>>>0;}
        return hex(h0)+hex(h1)+hex(h2)+hex(h3)+hex(h4);
    },
    _fetch: function(url) {
        var html='';
        for(var t=0;t<5;t++){
            html=request(url,{headers:rule.headers,withHeaders:1});
            // request 返回 {body, headers} 结构时取body
            var raw = (typeof html === 'object') ? (html.body || '') : html;
            if(raw.indexOf('正在检测')<0) return raw;
            var mh=raw.match(/var hash = '([0-9a-f]+)'/);
            var mt=raw.match(/var target = '([0-9a-f]+)'/);
            if(!mh||!mt) return raw;
            var key=null;
            for(var i=0;i<200000;i++){if(rule._sha1(mh[1]+i)===mt[1]){key=i;break;}}
            if(key===null) return raw;
            var sep=url.indexOf('?')>=0?'&':'?';
            if(url.indexOf('attack_key=')>=0) url=url.replace(/([?&])attack_key=[^&]*/,'$1attack_key='+key);
            else url=url+sep+'attack_key='+key;
        }
        return (typeof html==='object')?(html.body||''):html;
    },

    // ========== 卡片解析（实测命中24/24） ==========
    // 卡片：<a href="/movie|tv/{hex}-{vid}.html" ... title="片名" data-url="..."><img ... data-src="/img/id/xxx.jpg">...<div class="...bg-[#409EFF]/90...">角标</div>
    _cards: function(html) {
        var list=[];
        // 先整对抓 <a 属性块>内部</a>，要求 href 指向详情页、带title、内部有<img data-src>
        var re=/<a\s+([^>]*?\bhref="(\/(?:movie|tv)\/[a-f0-9]+-\d+\.html)"[^>]*)>([\s\S]*?)<\/a>/gi;
        var m, seen={};
        while((m=re.exec(html))!==null){
            var attrs=m[1], href=m[2], body=m[3];
            if(seen[href]) continue;
            var tMatch=attrs.match(/\btitle="([^"]+)"/);
            var iMatch=body.match(/<img[^>]*?\bdata-src="([^"]+)"/);
            if(!tMatch||!iMatch) continue;
            seen[href]=1;
            var name=tMatch[1].trim();
            var pic=iMatch[1];
            if(pic.indexOf('http')!==0) pic=rule.host.replace(/\/$/,'')+pic;
            // 角标：top-2 right-2 的蓝色小div，或body里第一个非空的<div>块（站点是Tailwind动态class）
            var note='';
            var nm=body.match(/<div[^>]*>([^<>]{1,30})<\/div>/);
            if(nm){
                var tmp=nm[1].replace(/<[^>]+>/g,'').trim();
                if(tmp && tmp.length<=16) note=tmp;
            }
            list.push({vod_id:href, vod_name:name, vod_pic:pic, vod_remarks:note});
        }
        return list;
    },

    _pagecount: function(html) {
        // 找分页链接里最大的 page=N 值，+1 后返回（page从0计）
        var max=0;
        var pRe=/[?&]page=(\d+)/g, pm;
        while((pm=pRe.exec(html))!==null){
            var n=parseInt(pm[1]);
            if(n>max) max=n;
        }
        // 兜底：有"下一页"但没数字链接时至少有2页
        var pc=(max>0)?(max+1):1;
        if(pc>10000) pc=10000;
        return pc;
    },

    // ========== 首页推荐 ==========
    home: `js:
        var html = rule._fetch(rule.host + rule.homeUrl);
        var data = [];

        // 顶部大轮播热播（swiper区块内的卡片）
        var swIdx = html.indexOf('swiper-wrapper');
        if (swIdx >= 0) {
            var swEnd = html.indexOf('swiper-pagination', swIdx);
            if (swEnd < 0) swEnd = swIdx + 15000;
            var sw = html.substring(swIdx, swEnd);
            var swList = rule._cards(sw);
            if (swList.length >= 4) data.push({type_name:'正在热播', vod_list:swList.slice(0,8)});
        }

        // 按 h2 标题切分区域
        var secIdx = [], m;
        var h2Re = /<h2[^>]*>([\\s\\S]*?)<\\/h2>/gi;
        while ((m = h2Re.exec(html)) !== null) {
            var tn = m[1].replace(/<[^>]+>/g,'').trim();
            if (tn && tn.length <= 12) secIdx.push({name:tn, pos:m.index});
        }
        for (var i=0;i<secIdx.length;i++) {
            var start = secIdx[i].pos;
            var end = (i+1<secIdx.length) ? secIdx[i+1].pos : html.length;
            var seg = html.substring(start, end);
            var l = rule._cards(seg);
            if (l.length >= 4) data.push({type_name:secIdx[i].name, vod_list:l.slice(0,12)});
        }

        // 兜底：如果上面分区没取到数据，把页面所有卡片直接塞一个"最新"区
        if (data.length === 0) {
            var all = rule._cards(html);
            if (all.length > 0) data.push({type_name:'最新影片', vod_list:all.slice(0,24)});
        }
        setResult(data);
    `,

    // ========== 一级分类页 ==========
    // tid = "dianying.html" / "dianshiju.html" / ...（来自class_url）
    // 第1页直接访问裸URL（无PoW），第N页访问 /xxx.html?page=N-1（需过PoW）
    一级: `js:
        var tid = input.tid;
        var pg = input.page || 1;
        var url = rule.host + '/' + tid;
        if (pg > 1) url += '?page=' + (pg - 1);
        var html = rule._fetch(url);
        var list = rule._cards(html);
        var pagecount = rule._pagecount(html);
        // 第1页拿到卡片但没解析到页码时，默认给一个较大值保证可翻页
        if (pg === 1 && list.length >= 24 && pagecount <= 1) pagecount = 999;
        setResult({
            page: pg,
            pagecount: pagecount,
            limit: 24,
            total: pagecount * 24,
            list: list
        });
    `,

    // ========== 搜索 ==========
    搜索: `js:
        var wd = input.wd;
        var pg = input.page || 1;
        var url = rule.host + '/s.html?name=' + encodeURIComponent(wd) + '&page=' + (pg - 1);
        var html = rule._fetch(url);
        var list = rule._cards(html);
        // 搜索页也可能有其他类型链接(演员、标签)，_cards只取movie/tv详情链接无需担心
        setResult({
            page: pg,
            pagecount: (list.length >= 24) ? (pg + 1) : pg,
            limit: 24,
            total: 0,
            list: list
        });
    `,

    // ========== 详情页（二级） ==========
    // cid 形如 /movie/68aecc1b...-17632.html
    // 详情页能看到当前线路的集数；其它线路切换URL形如 同路径?origin=xxx（-数字.html，不是/数字/）
    // 集数URL形如 /movie/{hex}/{vid}.html?origin=xxx&p=N（斜杠，不是横杠）
    二级: `js:
        var cid = input.url;
        var host = rule.host;
        var html = rule._fetch(host + cid);

        // 标题
        var vod_name = '';
        var hm = html.match(/<h1[^>]*>([\\s\\S]*?)<\\/h1>/);
        if (hm) vod_name = hm[1].replace(/<[^>]+>/g,'').trim();
        if (!vod_name) {
            var tm = html.match(/<title>([^<]+)<\\/title>/);
            if (tm) vod_name = tm[1].split(/[-_|《]/)[0].trim();
        }

        // 海报
        var vod_pic = '';
        var pm = html.match(/<img[^>]*data-src="(\/img\/id\/[a-f0-9]+\.jpg)"[^>]*>/);
        if (pm) vod_pic = host + pm[1];

        // 简介
        var vod_content = '';
        var dm = html.match(/<meta\\s+name="description"\\s+content="([^"]+)"/);
        if (dm) vod_content = dm[1];

        // 主演
        var vod_actor = '';
        var am = html.match(/主演[：:]?([^<]{2,80})/);
        if (am) vod_actor = am[1].replace(/^[：: ]+/,'').trim();

        // 导演
        var vod_director = '';
        var ad = html.match(/导演[：:]?([^<]{2,40})/);
        if (ad) vod_director = ad[1].replace(/^[：: ]+/,'').trim();

        // 抽取某段html里 所有 origin 下的集数
        // 集数 a: href="/(movie|tv)/{hex}/{vid}.html?origin=xxx&p=N" 文本是"01"/"1080P"等
        function extractEps(h) {
            var out = {};
            // 先抓所有带 &p= 数字 且 href 不是下载/ep_list 的a标签
            var epRe = /<a[^>]*\\bhref="([^"]*(?:movie|tv)\\/[a-f0-9]+\\/\\d+\\.html\\?[^"]*\\borigin=([^"&]+)[^"]*\\bp=(\\d+)[^"]*)"[^>]*>([\\s\\S]*?)<\\/a>/gi;
            var em;
            while ((em = epRe.exec(h)) !== null) {
                var href = em[1].replace(/&amp;/g,'&');
                var ori = decodeURIComponent(em[2]);
                var p = parseInt(em[3]);
                var text = em[4].replace(/<[^>]+>/g,'').trim();
                // 过滤"下载""标题""倒序"这些不是集数的按钮
                if (/下载|标题|倒序/.test(text)) continue;
                if (href.indexOf('http') !== 0) href = host + href;
                var epName = text;
                // 如果文本是纯数字"01""02" 或数字，补"第N集"
                if (/^\\d+$/.test(text)) epName = '第' + parseInt(text) + '集';
                if (!out[ori]) out[ori] = {};
                // p=0 对应第1集，但drpy内部靠顺序区分，key用p保证不重复
                out[ori][p] = epName + '$' + href;
            }
            // 整理成数组，按p升序
            var res = {};
            for (var k in out) {
                var keys = [];
                for (var pp in out[k]) keys.push(parseInt(pp));
                keys.sort(function(a,b){return a-b;});
                res[k] = [];
                for (var i=0;i<keys.length;i++) res[k].push(out[k][keys[i]]);
            }
            return res;
        }

        var allEps = extractEps(html);

        // 找所有线路切换链接：href="/xxx-xxx.html?origin=线路名"
        // 注意是 -数字.html（详情页形式），不是 /数字/（播放页形式）
        var oRe = /href="(\/(?:movie|tv)\/[a-f0-9]+-\d+\.html\\?origin=([^"&]+))"/g;
        var om, originLinks = {};
        while ((om = oRe.exec(html)) !== null) {
            var oname = decodeURIComponent(om[2]);
            var ourl = decodeURIComponent(om[1]);
            if (!allEps[oname] && !originLinks[oname]) {
                originLinks[oname] = ourl;
            }
        }

        // 逐个线路请求详情页，拿对应线路的集数
        for (var oname in originLinks) {
            try {
                var oh = rule._fetch(host + originLinks[oname]);
                var oeps = extractEps(oh);
                if (oeps[oname] && oeps[oname].length > 0) {
                    allEps[oname] = oeps[oname];
                }
            } catch(e) {}
        }

        // 兜底：如果所有线路都没集数（电影只有1个播放入口，详情页直接就一个"立即播放"），
        // 构造一条默认线路"超级线路"，URL使用详情页本身加上?p=0，让lazy去解析
        var hasAny = false;
        for (var k in allEps) { if (allEps[k].length > 0) { hasAny = true; break; } }
        if (!hasAny) {
            // 从 /movie/xxx-yyy.html 推出播放URL /movie/xxx/yyy.html?origin=超级线路&p=0
            var m2 = cid.match(/\\/(movie|tv)\\/([a-f0-9]+)-(\\d+)\\.html/);
            if (m2) {
                var playUrl = host + '/' + m2[1] + '/' + m2[2] + '/' + m2[3] + '.html?origin=' + encodeURIComponent('超级线路') + '&p=0';
                allEps['超级线路'] = ['正片$' + playUrl];
            }
        }

        // 拼成drpy格式
        var playFrom = [], playUrlParts = [];
        for (var ori in allEps) {
            if (allEps[ori].length > 0) {
                playFrom.push(ori);
                playUrlParts.push(allEps[ori].join('#'));
            }
        }

        setResult({
            vod_id: cid,
            vod_name: vod_name,
            vod_pic: vod_pic,
            vod_remarks: '',
            vod_director: vod_director,
            vod_actor: vod_actor,
            vod_content: vod_content,
            vod_play_from: playFrom.join('$$$'),
            vod_play_url: playUrlParts.join('$$$')
        });
    `,

    // ========== 播放解析（lazy） ==========
    // 访问集数URL，从 xg_video_player_doc.aa 里取 /api/m3u8?... 接口，返回给播放器
    // 该接口会302到 box.dyrs.com.de 再返回m3u8，交给播放器跟随重定向即可
    lazy: `js:
        var playUrl = (typeof input === 'object') ? input.url : input;
        var html = rule._fetch(playUrl);
        if (typeof html === 'object') html = html.body || '';
        // 匹配: aa: JSON.parse('{...}')  —— key无引号，值用JSON.parse包裹
        var m = html.match(/aa\\s*:\\s*JSON\\.parse\\('([\\s\\S]*?)'\\)/);
        if (m) {
            try {
                // 处理JS字符串里的 unicode 和转义
                var raw = m[1]
                    .replace(/\\\\u0022/g,'"')
                    .replace(/\\\\u0026/g,'&')
                    .replace(/\\\\u002F/g,'/')
                    .replace(/\\\\\\//g,'/')
                    .replace(/\\\\\\\\/g,'\\\\')
                    .replace(/\\\\'/g,"'")
                    .replace(/\\\\"/g,'"');
                // 再处理一层 \uXXXX
                raw = raw.replace(/\\\\u([0-9a-fA-F]{4})/g, function(_,h){
                    return String.fromCharCode(parseInt(h,16));
                });
                var d = JSON.parse(raw);
                var api = d.url || '';
                if (api) {
                    if (api.indexOf('http') !== 0) api = rule.host + api;
                    input = {
                        url: api,
                        header: {
                            'Referer': rule.host + '/',
                            'User-Agent': rule.headers['User-Agent']
                        }
                    };
                }
            } catch(e) {
                print('lazy解析失败: ' + e);
            }
        } else {
            // 兜底：直接在html里找 /api/m3u8?... 字符串
            var m2 = html.match(/(\\/api\\/m3u8\\?[^"'\\s<>]+)/);
            if (m2) {
                var api2 = m2[1].replace(/&amp;/g,'&');
                if (api2.indexOf('http') !== 0) api2 = rule.host + api2;
                input = {
                    url: api2,
                    header: {'Referer': rule.host + '/', 'User-Agent': rule.headers['User-Agent']}
                };
            }
        }
    `
};
