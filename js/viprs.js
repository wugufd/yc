// viprs4.cc drpy 规则 v6 - 点击5个一级分类直接显示"全部"内容
// 解决：去掉二级子分类展开，点电影/电视剧/综艺/动漫/短剧直接出列表
// 适配 TVBox / 猫影视 / 影视仓 / zyplayer 等 drpy 兼容App

var rule = {
    title: '韩剧网(viprs4)',
    host: 'https://viprs4.cc',
    homeUrl: '/',
    // url 模板：fyclass 后面直接跟 tid（即 dianying.html / dianshiju.html 等）
    // 这样 drpy 拼出来的分类URL就是 https://viprs4.cc/dianying.html —— 正好是"全部"内容页
    url: '/fyclass',
    searchUrl: '/s.html?name=**&page=fypage',
    searchable: 2,
    quickSearch: 0,
    filterable: 0,             // 关闭筛选（避免App展开类型/地区/年份子菜单）
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://viprs4.cc/'
    },
    timeout: 20000,

    // ===== 只保留5个一级分类；tid 就是 xxx.html 本身，直接访问 = 该分类"全部"子菜单 =====
    class_name: '电影&电视剧&综艺&动漫&短剧',
    class_url:  'dianying.html&dianshiju.html&zongyi.html&dongman.html&duanju.html',

    // ========== 公共工具：带PoW反爬的请求 ==========
    _fetch: function(url) {
        var html = '';
        for (var t = 0; t < 8; t++) {
            html = request(url, {headers: rule.headers});
            if (!html || html.indexOf('正在检测') < 0) break;
            var mh = html.match(/var hash = '([0-9a-f]+)'/);
            var mt = html.match(/var target = '([0-9a-f]+)'/);
            if (!mh || !mt) break;
            var key = rule._pow(mh[1], mt[1]);
            if (key === null) break;
            var sep = url.indexOf('?') >= 0 ? '&' : '?';
            if (url.indexOf('attack_key=') >= 0) {
                url = url.replace(/([?&])attack_key=[^&]*/, '$1attack_key=' + key);
            } else {
                url = url + sep + 'attack_key=' + key;
            }
        }
        return html;
    },
    // SHA1 PoW求解（裸URL一般不会触发，仅带参数的搜索/翻页可能触发）
    _pow: function(hash, target) {
        function sha1(s) {
            function rot(n, c) { return ((n << c) | (n >>> (32 - c))) >>> 0; }
            function hex(v) { var str = ''; for (var i = 7; i >= 0; i--) str += ((v >>> (i * 4)) & 0xf).toString(16); return str; }
            var bytes = unescape(encodeURIComponent(s));
            var blks = ((bytes.length + 8) >> 6) + 1;
            var b = new Array(blks * 16);
            for (var i = 0; i < blks * 16; i++) b[i] = 0;
            for (var i = 0; i < bytes.length; i++) b[i >> 2] |= bytes.charCodeAt(i) << (24 - (i % 4) * 8);
            b[i >> 2] |= 0x80 << (24 - (i % 4) * 8);
            b[blks * 16 - 1] = bytes.length * 8;
            var w = new Array(80);
            var h0 = 0x67452301, h1 = 0xEFCDAB89, h2 = 0x98BADCFE, h3 = 0x10325476, h4 = 0xC3D2E1F0;
            for (var i = 0; i < blks; i++) {
                var a = h0, bb = h1, c = h2, d = h3, e = h4;
                for (var j = 0; j < 80; j++) {
                    if (j < 16) w[j] = b[i * 16 + j];
                    else w[j] = rot(w[j-3] ^ w[j-8] ^ w[j-14] ^ w[j-16], 1);
                    var f, k;
                    if (j < 20) { f = (bb & c) | (~bb & d); k = 0x5A827999; }
                    else if (j < 40) { f = bb ^ c ^ d; k = 0x6ED9EBA1; }
                    else if (j < 60) { f = (bb & c) | (bb & d) | (c & d); k = 0x8F1BBCDC; }
                    else { f = bb ^ c ^ d; k = 0xCA62C1D6; }
                    var tmp = (rot(a,5) + f + e + k + w[j]) >>> 0;
                    e = d; d = c; c = rot(bb,30); bb = a; a = tmp;
                }
                h0 = (h0 + a) >>> 0; h1 = (h1 + bb) >>> 0; h2 = (h2 + c) >>> 0;
                h3 = (h3 + d) >>> 0; h4 = (h4 + e) >>> 0;
            }
            return hex(h0)+hex(h1)+hex(h2)+hex(h3)+hex(h4);
        }
        for (var i = 0; i < 50000; i++) {
            if (sha1(hash + i) === target) return i;
        }
        return null;
    },

    // ========== 通用：从HTML里提取影片卡片 ==========
    // 卡片结构：<a href="/movie/xxxxx-数字.html" ... title="片名"> ... <img ... data-src="/img/id/xxxxx.jpg" ...>
    _cards: function(html) {
        var list = [];
        // 允许 href 与 title 任意属性顺序；a 与 img 之间允许任意空白/换行
        var re = /<a(?=[^>]*\bhref="(\/(?:movie|tv)\/[a-f0-9]+-\d+\.html)")(?=[^>]*\btitle="([^"]+)")[^>]*>[\s\S]*?<img[^>]*\bdata-src="([^"]+)"/gi;
        var m, seen = {};
        while ((m = re.exec(html)) !== null) {
            var href = m[1], name = m[2], pic = m[3];
            if (seen[href]) continue;
            seen[href] = 1;
            if (pic.indexOf('http') !== 0) {
                // data-src 可能是 /img/id/xxx.jpg 绝对路径，拼到host上
                pic = rule.host.replace(/\/$/, '') + pic;
            }
            // 找角标（如"HD"、"1080p"、"更新至第02集"）
            var note = '';
            var tail = html.substr(re.lastIndex, 600);
            var nm = tail.match(/<span[^>]*class="[^"]*bg-[^"]*"[^>]*>([\s\S]*?)<\/span>/);
            if (nm) note = nm[1].replace(/<[^>]+>/g, '').trim();
            list.push({
                vod_id: href,
                vod_name: name.trim(),
                vod_pic: pic,
                vod_remarks: note
            });
        }
        return list;
    },

    // 从页面里取最大页码（翻页用）
    _pagecount: function(html, pg) {
        var pc = pg + 1;
        var pRe = /[?&]page=(\d+)/g, pm;
        while ((pm = pRe.exec(html)) !== null) {
            var n = parseInt(pm[1]) + 1;
            if (n > pc) pc = n;
        }
        // 兜底：如果有"下一页"且没找到数字，就 +1
        if (pc <= pg) pc = pg + 1;
        if (pc > 5000) pc = 5000; // 防异常
        return pc;
    },

    // ========== 首页（推荐） ==========
    home: `js:
        var html = rule._fetch(rule.host + rule.homeUrl);
        var data = [];
        // 大轮播热播
        var sw = html.match(/swiper-wrapper[\\s\\S]{0,10000}?swiper-pagination/);
        if (sw) { var l = rule._cards(sw[0]); if (l.length >= 4) data.push({type_name:'正在热播', vod_list:l.slice(0,8)}); }
        // 按分区（h2 后面紧跟的卡片区域）
        var titles = [], tm;
        var tRe = /<h2[^>]*>([\\s\\S]*?)<\\/h2>/gi;
        while ((tm = tRe.exec(html)) !== null) {
            var tn = tm[1].replace(/<[^>]+>/g,'').trim();
            if (tn && tn.length <= 12) titles.push({name:tn, pos:tm.index});
        }
        for (var i=0;i<titles.length;i++) {
            var start = titles[i].pos;
            var end = (i+1 < titles.length) ? titles[i+1].pos : html.length;
            var seg = html.substring(start, end);
            var l = rule._cards(seg);
            if (l.length >= 4) data.push({type_name:titles[i].name, vod_list:l.slice(0,12)});
        }
        setResult(data);
    `,

    // ========== 分类页（一级） ==========
    // tid 形如 "dianying.html"，直接访问裸URL = "全部"子菜单的第1页；
    // 第2页起加 ?page=N
    一级: `js:
        var tid = input.tid;
        var pg = input.page || 1;
        var url = rule.host + '/' + tid;
        if (pg > 1) {
            url += '?page=' + (pg - 1);
        }
        var html = rule._fetch(url);
        var list = rule._cards(html);
        var pagecount = rule._pagecount(html, pg);
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
        setResult({
            page: pg,
            pagecount: pg + 1,
            limit: 24,
            total: (pg + 1) * 24,
            list: list
        });
    `,

    // ========== 详情页 ==========
    // 直接在二级(JS)里完成所有线路/集数解析，避免依赖drpy默认CSS选择器
    二级: `js:
        var cid = input.url;
        var host = rule.host;
        var html = rule._fetch(host + cid);

        // 标题：从 <h1>...</h1> 或 <title>
        var vod_name = '';
        var hm = html.match(/<h1[^>]*>([\\s\\S]*?)<\\/h1>/);
        if (hm) vod_name = hm[1].replace(/<[^>]+>/g,'').trim();
        if (!vod_name) {
            var tm = html.match(/<title>([^<]+)<\\/title>/);
            if (tm) vod_name = tm[1].replace(/_.*?$/,'').trim();
        }

        // 海报：主图 data-src
        var vod_pic = '';
        var pm = html.match(/<img[^>]*data-src="(\/img\/id\/[a-f0-9]+\.jpg)"[^>]*class="[^"]*aspect/);
        if (pm) vod_pic = host + pm[1];

        // 简介
        var vod_content = '';
        var dm = html.match(/<meta\\s+name="description"\\s+content="([^"]+)"/);
        if (dm) vod_content = dm[1];

        // 主演/导演：从description里粗略提取
        var vod_actor = '', vod_director = '';
        var am = vod_content.match(/主演[:：]?([^，。；<]+)/);
        if (am) vod_actor = am[1].trim();

        // 抽取某段html里 某个origin 下的集数
        function extractEps(h) {
            // <a ... data-origin="xxx" href="/tv/xxx/yyy.html?origin=xxx&p=N" ... data-title="第N集">标题</a>
            var epRe = /<a(?=[^>]*\\bdata-origin="([^"]+)")(?=[^>]*\\bhref="([^"]*\\bp=(\\d+)[^"]*)")[^>]*\\bdata-title="([^"]*)"[^>]*>([\\s\\S]*?)<\\/a>/g;
            var out = {}, em;
            while ((em = epRe.exec(h)) !== null) {
                var ori = em[1];
                var href = em[2].replace(/&amp;/g,'&');
                var p = parseInt(em[3]);
                var title = (em[4] || em[5]).replace(/<[^>]+>/g,'').trim();
                if (!title) title = '第' + (p+1) + '集';
                if (href.indexOf('http') !== 0) href = host + href;
                if (!out[ori]) out[ori] = {};
                out[ori][p] = title + '$' + href;
            }
            var res = {};
            for (var k in out) {
                var keys = [];
                for (var p in out[k]) keys.push(parseInt(p));
                keys.sort(function(a,b){return a-b;});
                res[k] = [];
                for (var i=0;i<keys.length;i++) res[k].push(out[k][keys[i]]);
            }
            return res;
        }

        // 当前页的线路+集数
        var allEps = extractEps(html);

        // 查找其他线路切换链接 <a href="/xxx.html?origin=线路名">
        var originLinks = {};
        var olRe = /href="(\/(?:movie|tv)\/[a-f0-9]+-\d+\.html\\?origin=([^"&]+))"/g;
        var om;
        while ((om = olRe.exec(html)) !== null) {
            var oname = decodeURIComponent(om[2]);
            if (!originLinks[oname] && !allEps[oname]) {
                originLinks[oname] = decodeURIComponent(om[1]);
            }
        }
        // 逐个线路请求拿集数
        for (var oname in originLinks) {
            try {
                var oh = rule._fetch(host + originLinks[oname]);
                var oeps = extractEps(oh);
                if (oeps[oname] && oeps[oname].length > 0) {
                    allEps[oname] = oeps[oname];
                }
            } catch(e) {}
        }

        // 拼成 drpy 要求的格式
        var playFrom = [], playUrlParts = [];
        for (var ori in allEps) {
            if (allEps[ori].length > 0) {
                playFrom.push(ori);
                playUrlParts.push(ori + '$' + allEps[ori].join('#'));
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

    // ========== 播放解析 ==========
    play_parse: true,
    lazy: `js:
        var html = request(input, {headers: rule.headers});
        // xg_video_player_doc = { ... aa: JSON.parse('{...}') }
        var m = html.match(/aa\\s*:\\s*JSON\\.parse\\('([\\s\\S]*?)'\\)/);
        if (m) {
            try {
                var raw = m[1]
                    .replace(/\\\\u0022/g,'"')
                    .replace(/\\\\u0026/g,'&')
                    .replace(/\\\\\\//g,'/')
                    .replace(/\\\\'/g,"'")
                    .replace(/\\\\"/g,'"');
                var d = JSON.parse(raw);
                var api = d.url || '';
                if (api) {
                    if (api.indexOf('http') !== 0) api = rule.host + api;
                    input = {url: api, header: {Referer: rule.host + '/', 'User-Agent': rule.headers['User-Agent']}};
                }
            } catch(e) { print('lazy解析失败:'+e); }
        }
    `
};
