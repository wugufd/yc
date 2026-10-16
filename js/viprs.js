// viprs4.cc drpy 规则 - 仅搜索精简版
// 移除首页推荐与分类入口，仅保留搜索/详情/播放功能
// 彻底规避分类页404问题，打开直接可用搜索
// 适配 TVBox / 猫影视 / 影视仓 / zyplayer / drpy T1 等

var rule = {
    title: '韩剧影视-仅搜索',
    host: 'https://viprs4.cc',
    homeUrl: '/',
    url: '/fyclass',
    searchUrl: '/s.html?name=**&page=fypage',
    searchable: 2,
    quickSearch: 0,
    filterable: 0,
    play_parse: true,
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://viprs4.cc/'
    },
    timeout: 20000,

    // 清空分类配置，彻底隐藏顶部分类标签，不触发任何分类请求
    class_name: '',
    class_url: '',

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
            var raw = (typeof html === 'object') ? (html.body || '') : (html || '');
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
        return (typeof html==='object')?(html.body||''):(html||'');
    },

    // ========== 卡片解析 ==========
    _cards: function(html) {
        var list=[];
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

    // ========== 首页：返回空数据，不加载推荐，直接显示搜索界面 ==========
    home: `js:
        setResult([]);
    `,

    // ========== 搜索（完整保留） ==========
    搜索: `js:
        var wd = input.wd;
        var pg = input.page || 1;
        var url = rule.host + '/s.html?name=' + encodeURIComponent(wd) + '&page=' + (pg - 1);
        var html = rule._fetch(url);
        var list = rule._cards(html);
        setResult({
            page: pg,
            pagecount: (list.length >= 24) ? (pg + 1) : pg,
            limit: 24,
            total: 0,
            list: list
        });
    `,

    // ========== 详情页（二级，完整保留） ==========
    二级: `js:
        var cid = input.url;
        var host = rule.host;
        var html = rule._fetch(host + cid);

        var vod_name = '';
        var hm = html.match(/<h1[^>]*>([\\s\\S]*?)<\\/h1>/);
        if (hm) vod_name = hm[1].replace(/<[^>]+>/g,'').trim();
        if (!vod_name) {
            var tm = html.match(/<title>([^<]+)<\\/title>/);
            if (tm) vod_name = tm[1].split(/[-_|《]/)[0].trim();
        }

        var vod_pic = '';
        var pm = html.match(/<img[^>]*data-src="(\\/img\\/id\\/[a-f0-9]+\\.jpg)"[^>]*>/);
        if (pm) vod_pic = host + pm[1];

        var vod_content = '';
        var dm = html.match(/<meta\\s+name="description"\\s+content="([^"]+)"/);
        if (dm) vod_content = dm[1];

        var vod_actor = '';
        var am = html.match(/主演[：:]?([^<]{2,80})/);
        if (am) vod_actor = am[1].replace(/^[：: ]+/,'').trim();

        var vod_director = '';
        var ad = html.match(/导演[：:]?([^<]{2,40})/);
        if (ad) vod_director = ad[1].replace(/^[：: ]+/,'').trim();

        function extractEps(h) {
            var out = {};
            var epRe = /<a[^>]*\\bhref="([^"]*(?:movie|tv)\\/[a-f0-9]+\\/\\d+\\.html\\?[^"]*\\borigin=([^"&]+)[^"]*\\bp=(\\d+)[^"]*)"[^>]*>([\\s\\S]*?)<\\/a>/gi;
            var em;
            while ((em = epRe.exec(h)) !== null) {
                var href = em[1].replace(/&amp;/g,'&');
                var ori = decodeURIComponent(em[2]);
                var p = parseInt(em[3]);
                var text = em[4].replace(/<[^>]+>/g,'').trim();
                if (/下载|标题|倒序/.test(text)) continue;
                if (href.indexOf('http') !== 0) href = host + href;
                var epName = text;
                if (/^\\d+$/.test(text)) epName = '第' + parseInt(text) + '集';
                if (!out[ori]) out[ori] = {};
                out[ori][p] = epName + '$' + href;
            }
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

        var oRe = /href="(\\/(?:movie|tv)\\/[a-f0-9]+-\\d+\\.html\\?origin=([^"&]+))"/g;
        var om, originLinks = {};
        while ((om = oRe.exec(html)) !== null) {
            var oname = decodeURIComponent(om[2]);
            var ourl = decodeURIComponent(om[1]);
            if (!allEps[oname] && !originLinks[oname]) {
                originLinks[oname] = ourl;
            }
        }

        for (var oname in originLinks) {
            try {
                var oh = rule._fetch(host + originLinks[oname]);
                var oeps = extractEps(oh);
                if (oeps[oname] && oeps[oname].length > 0) {
                    allEps[oname] = oeps[oname];
                }
            } catch(e) {}
        }

        var hasAny = false;
        for (var k in allEps) { if (allEps[k].length > 0) { hasAny = true; break; } }
        if (!hasAny) {
            var m2 = cid.match(/\\/(movie|tv)\\/([a-f0-9]+)-(\\d+)\\.html/);
            if (m2) {
                var playUrl = host + '/' + m2[1] + '/' + m2[2] + '/' + m2[3] + '.html?origin=' + encodeURIComponent('超级线路') + '&p=0';
                allEps['超级线路'] = ['正片$' + playUrl];
            }
        }

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

    // ========== 播放解析（lazy，完整保留） ==========
    lazy: `js:
        var playUrl = (typeof input === 'object') ? input.url : input;
        var html = rule._fetch(playUrl);
        if (typeof html === 'object') html = html.body || '';
        var m = html.match(/aa\\s*:\\s*JSON\\.parse\\('([\\s\\S]*?)'\\)/);
        if (m) {
            try {
                var raw = m[1]
                    .replace(/\\\\u0022/g,'"')
                    .replace(/\\\\u0026/g,'&')
                    .replace(/\\\\u002F/g,'/')
                    .replace(/\\\\\\//g,'/')
                    .replace(/\\\\'/g,"'")
                    .replace(/\\\\"/g,'"');
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
