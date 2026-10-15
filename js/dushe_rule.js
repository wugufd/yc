var rule = {
    title: '毒舌电影',
    host: 'https://www.dushe05.com',
    homeUrl: '/',
    url: '/channel/fyclass.html',
    searchUrl: '/search?k=**&t=',
    searchable: 2,
    quickSearch: 0,
    filterable: 0,
    headers: {
        'User-Agent': 'MOBILE_UA',
        'Referer': 'https://www.dushe05.com/'
    },
    timeout: 30000,
    class_name: '电影&连续剧&动漫&综艺纪录&短剧&今日更新',
    class_url: '1&2&3&4&6&new',

    // ============ 首页推荐 ============
    推荐: `js:
        // ---- 工具函数：cdndefend 校验 ----
        function ensureCookie() {
            if (globalThis.__dd_cookie) return;
            let html = request(HOST + '/');
            if (html.indexOf('Protected by cdndefend') === -1) {
                globalThis.__dd_cookie = 'ok';
                return;
            }
            let arrMatch = html.match(/a0_0x2a54\\s*=\\s*\\[([^\\]]+)\\]/);
            if (!arrMatch) return;
            let items = [];
            arrMatch[1].replace(/'([^']*)'/g, function(_, s){ items.push(s); });
            for (let i = 0; i < 0x178; i++) items.push(items.shift());
            let key = items[2];
            let n1 = parseInt(key[0], 16);
            let found = null;
            for (let i = 0; i < 500000; i++) {
                let h = CryptoJS.SHA1(key + i).toString();
                if (parseInt(h.substr(n1*2, 2), 16) === 0xb0 &&
                    parseInt(h.substr(n1*2+2, 2), 16) === 0x0b) {
                    found = key + i; break;
                }
            }
            if (found) {
                setItem('cookie', 'cdndefend_js_cookie=' + found);
            }
            globalThis.__dd_cookie = found || 'ok';
        }

        function safeGet(url) {
            let html = request(url);
            if (html.indexOf('Protected by cdndefend') !== -1) {
                globalThis.__dd_cookie = null;
                ensureCookie();
                html = request(url);
            }
            return html;
        }

        // ---- 主逻辑 ----
        ensureCookie();
        let html = safeGet(HOST + '/');

        // 存搜索 t token
        let tMatch = html.match(/name="t"\\s+value="([^"]+)"/);
        globalThis.__search_t = tMatch ? tMatch[1] : '';

        let d = [];
        let items = pdfa(html, 'a.v-item');
        items.forEach(function(it){
            let href = pd(it, 'a&&href', HOST);
            if (!href || href.indexOf('/detail/') === -1) return;
            let titles = pdfa(it, '.v-item-title');
            let title = '';
            for (let t=0;t<titles.length;t++){
                let tx = pdfh(titles[t], '&&Text').trim();
                if (tx && tx.indexOf('kkys') === -1 && tx.indexOf('可可') === -1 && tx.indexOf('影视') === -1){ title=tx; break; }
            }
            if (!title) title = pdfh(it, '.v-item-title&&Text').trim();
            let imgs = pdfa(it, 'img.lazyload');
            let pic = '';
            for (let g=0;g<imgs.length;g++){
                let u=pd(imgs[g],'img&&data-original',HOST);
                if(u && u.indexOf('placeholder')===-1){pic=u;break;}
            }
            if(!pic && imgs.length) pic = pd(imgs[0],'img&&data-original',HOST);
            let note = pdfh(it, '.v-item-bottom&&Text').trim();
            let tag = pdfh(it, '.v-item-top-left&&Text').trim();
            d.push({
                vod_id: href,
                vod_name: title,
                vod_pic: pic,
                vod_remarks: note || tag || ''
            });
        });
        VODS = d;
    `,

    // ============ 一级分类 ============
    一级: `js:
        // ---- 工具函数：cdndefend 校验 ----
        function ensureCookie() {
            if (globalThis.__dd_cookie) return;
            let html = request(HOST + '/');
            if (html.indexOf('Protected by cdndefend') === -1) {
                globalThis.__dd_cookie = 'ok';
                return;
            }
            let arrMatch = html.match(/a0_0x2a54\\s*=\\s*\\[([^\\]]+)\\]/);
            if (!arrMatch) return;
            let items = [];
            arrMatch[1].replace(/'([^']*)'/g, function(_, s){ items.push(s); });
            for (let i = 0; i < 0x178; i++) items.push(items.shift());
            let key = items[2];
            let n1 = parseInt(key[0], 16);
            let found = null;
            for (let i = 0; i < 500000; i++) {
                let h = CryptoJS.SHA1(key + i).toString();
                if (parseInt(h.substr(n1*2, 2), 16) === 0xb0 &&
                    parseInt(h.substr(n1*2+2, 2), 16) === 0x0b) {
                    found = key + i; break;
                }
            }
            if (found) {
                setItem('cookie', 'cdndefend_js_cookie=' + found);
            }
            globalThis.__dd_cookie = found || 'ok';
        }

        function safeGet(url) {
            let html = request(url);
            if (html.indexOf('Protected by cdndefend') !== -1) {
                globalThis.__dd_cookie = null;
                ensureCookie();
                html = request(url);
            }
            return html;
        }

        // ---- 主逻辑 ----
        ensureCookie();
        let cate = MY_CATE;
        let pageUrl;
        if (cate === 'new') {
            pageUrl = HOST + '/label/new.html';
        } else {
            pageUrl = HOST + '/channel/' + cate + '.html';
        }
        let html = safeGet(pageUrl);

        let d = [];
        let items = pdfa(html, 'a.v-item');
        items.forEach(function(it) {
            let href = pd(it, 'a&&href', HOST);
            if (!href || href.indexOf('/detail/') === -1) return;
            let titles = pdfa(it, '.v-item-title');
            let title = '';
            if (titles && titles.length) {
                for (let t = 0; t < titles.length; t++) {
                    let tx = pdfh(titles[t], '&&Text').trim();
                    if (tx && tx.indexOf('kkys') === -1 && tx.indexOf('影视') === -1 && tx.indexOf('可可') === -1) {
                        title = tx; break;
                    }
                }
                if (!title) title = pdfh(it, '.v-item-title&&Text').trim();
            } else {
                title = pdfh(it, '.v-item-title&&Text').trim();
            }
            let imgs = pdfa(it, 'img.lazyload');
            let pic = '';
            for (let g = 0; g < imgs.length; g++) {
                let u = pd(imgs[g], 'img&&data-original', HOST);
                if (u && u.indexOf('placeholder') === -1) { pic = u; break; }
            }
            if (!pic && imgs.length) pic = pd(imgs[0], 'img&&data-original', HOST);
            let note = pdfh(it, '.v-item-bottom&&Text').trim();
            let tag = pdfh(it, '.v-item-top-left&&Text').trim();
            let desc = note || tag || '';
            d.push({
                vod_id: href,
                vod_name: title,
                vod_pic: pic,
                vod_remarks: desc
            });
        });
        VODS = d;
    `,

    // ============ 二级详情 ============
    二级: {
        "title": ".detail-title strong:eq(1)&&Text;.detail-tags a:eq(0)&&Text",
        "img": ".detail-box img.lazyload&&data-original",
        "desc": ".detail-info-row:eq(3) a:eq(0)&&Text;.detail-info-row:eq(2) a:eq(0)&&Text;.detail-info-row:eq(1) a:eq(0)&&Text;.detail-info-row:eq(0) a:eq(0)&&Text",
        "content": ".detail-desc&&Text",
        "tabs": ".source-item .source-item-label",
        "lists": ".episode-list:eq(#id) a"
    },

    // ============ 搜索 ============
    搜索: `js:
        // ---- 工具函数：cdndefend 校验 ----
        function ensureCookie() {
            if (globalThis.__dd_cookie) return;
            let html = request(HOST + '/');
            if (html.indexOf('Protected by cdndefend') === -1) {
                globalThis.__dd_cookie = 'ok';
                return;
            }
            let arrMatch = html.match(/a0_0x2a54\\s*=\\s*\\[([^\\]]+)\\]/);
            if (!arrMatch) return;
            let items = [];
            arrMatch[1].replace(/'([^']*)'/g, function(_, s){ items.push(s); });
            for (let i = 0; i < 0x178; i++) items.push(items.shift());
            let key = items[2];
            let n1 = parseInt(key[0], 16);
            let found = null;
            for (let i = 0; i < 500000; i++) {
                let h = CryptoJS.SHA1(key + i).toString();
                if (parseInt(h.substr(n1*2, 2), 16) === 0xb0 &&
                    parseInt(h.substr(n1*2+2, 2), 16) === 0x0b) {
                    found = key + i; break;
                }
            }
            if (found) {
                setItem('cookie', 'cdndefend_js_cookie=' + found);
            }
            globalThis.__dd_cookie = found || 'ok';
        }

        function safeGet(url) {
            let html = request(url);
            if (html.indexOf('Protected by cdndefend') !== -1) {
                globalThis.__dd_cookie = null;
                ensureCookie();
                html = request(url);
            }
            return html;
        }

        // ---- 主逻辑 ----
        ensureCookie();
        let homeHtml = safeGet(HOST + '/');
        let tMatch = homeHtml.match(/name="t"\\s+value="([^"]+)"/);
        let t = tMatch ? tMatch[1] : '';
        let searchUrl = HOST + '/search?k=' + encodeURIComponent(KEY) + '&t=' + encodeURIComponent(t);
        let html = safeGet(searchUrl);

        let d = [];
        let items = pdfa(html, 'a.v-item');
        items.forEach(function(it){
            let href = pd(it, 'a&&href', HOST);
            if (!href || href.indexOf('/detail/') === -1) return;
            let titles = pdfa(it, '.v-item-title');
            let title = '';
            for (let ti=0;ti<titles.length;ti++){
                let tx = pdfh(titles[ti], '&&Text').trim();
                if(tx && tx.indexOf('kkys')===-1 && tx.indexOf('可可')===-1 && tx.indexOf('影视')===-1){title=tx;break;}
            }
            if(!title) title = pdfh(it,'.v-item-title&&Text').trim();
            let imgs = pdfa(it,'img.lazyload');
            let pic='';
            for(let g=0;g<imgs.length;g++){
                let u=pd(imgs[g],'img&&data-original',HOST);
                if(u && u.indexOf('placeholder')===-1){pic=u;break;}
            }
            if(!pic && imgs.length) pic=pd(imgs[0],'img&&data-original',HOST);
            let note = pdfh(it,'.v-item-bottom&&Text').trim();
            let tag = pdfh(it,'.v-item-top-left&&Text').trim();
            d.push({
                vod_id: href,
                vod_name: title,
                vod_pic: pic,
                vod_remarks: note || tag || ''
            });
        });
        VODS = d;
    `,

    // ============ 播放解析 ============
    lazy: `js:
        let html = request(input);
        if (html.indexOf('Protected by cdndefend') !== -1) {
            // 遇到 CDN 校验时，先请求首页触发一次校验流程
            let ch = request(HOST + '/');
            let am = ch.match(/a0_0x2a54\\s*=\\s*\\[([^\\]]+)\\]/);
            if (am) {
                let items = [];
                am[1].replace(/'([^']*)'/g, function(_,s){items.push(s);});
                for (let i=0;i<0x178;i++) items.push(items.shift());
                let key = items[2], n1 = parseInt(key[0],16), found=null;
                for (let i=0;i<500000;i++){
                    let h=CryptoJS.SHA1(key+i).toString();
                    if(parseInt(h.substr(n1*2,2),16)===0xb0 && parseInt(h.substr(n1*2+2,2),16)===0x0b){found=key+i;break;}
                }
                if(found){ try{ setItem('cookie','cdndefend_js_cookie='+found); }catch(e){} }
            }
            html = request(input);
        }
        // 优先匹配 const playSource = { src: "URL", ... };
        let m = html.match(/playSource\\s*=\\s*\\{[\\s\\S]*?src\\s*:\\s*["']([^"']+)["']/);
        if (!m) {
            // 备选：直接找 url: "xxx.m3u8?xxx" 或 xxx.mp4
            m = html.match(/url\\s*:\\s*["']([^"']+?\\.(m3u8|mp4)[^"']*)["']/);
        }
        if (m) {
            input = m[1];
        }
    `
};