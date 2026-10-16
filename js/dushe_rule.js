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
        let html = request(HOST + '/');
        let d = [];
        let items = pdfa(html, 'a.v-item');
        items.forEach(function(it) {
            let href = pd(it, 'a&&href', HOST);
            if (!href || href.indexOf('/detail/') === -1) return;
            // 标题：跳过水印
            let titles = pdfa(it, '.v-item-title');
            let title = '';
            for (let t = 0; t < titles.length; t++) {
                let tx = pdfh(titles[t], '&&Text').trim();
                if (tx && tx.indexOf('可可影视') === -1 && tx.indexOf('kekys') === -1) {
                    title = tx; break;
                }
            }
            // 封面：跳过占位图
            let imgs = pdfa(it, 'img.lazyload');
            let pic = '';
            for (let g = 0; g < imgs.length; g++) {
                let u = pd(imgs[g], 'img&&data-original', HOST);
                if (u && u.indexOf('placeholder') === -1) { pic = u; break; }
            }
            let note = pdfh(it, '.v-item-bottom&&Text').trim();
            d.push({
                vod_id: href,
                vod_name: title,
                vod_pic: pic,
                vod_remarks: note
            });
        });
        VODS = d;
    `,

    // ============ 一级分类 ============
    一级: `js:
        let cate = MY_CATE;
        let pageUrl;
        if (cate === 'new') {
            pageUrl = HOST + '/label/new.html';
        } else {
            pageUrl = HOST + '/channel/' + cate + '.html';
        }
        let html = request(pageUrl);
        let d = [];
        let items = pdfa(html, 'a.v-item');
        items.forEach(function(it) {
            let href = pd(it, 'a&&href', HOST);
            if (!href || href.indexOf('/detail/') === -1) return;
            let titles = pdfa(it, '.v-item-title');
            let title = '';
            for (let t = 0; t < titles.length; t++) {
                let tx = pdfh(titles[t], '&&Text').trim();
                if (tx && tx.indexOf('可可影视') === -1 && tx.indexOf('kekys') === -1) {
                    title = tx; break;
                }
            }
            let imgs = pdfa(it, 'img.lazyload');
            let pic = '';
            for (let g = 0; g < imgs.length; g++) {
                let u = pd(imgs[g], 'img&&data-original', HOST);
                if (u && u.indexOf('placeholder') === -1) { pic = u; break; }
            }
            let note = pdfh(it, '.v-item-bottom&&Text').trim();
            d.push({
                vod_id: href,
                vod_name: title,
                vod_pic: pic,
                vod_remarks: note
            });
        });
        VODS = d;
    `,

    // ============ 二级详情 ============
    二级: {
        "title": ".detail-title strong:eq(1)&&Text;.detail-tags a:eq(0)&&Text",
        "img": ".detail-pic img.lazyload&&data-original",
        "desc": ".detail-info-row:eq(2)&&Text;.detail-info-row:eq(1)&&Text;.detail-info-row:eq(0)&&Text",
        "content": ".detail-desc&&Text",
        "tabs": ".source-item .source-item-label",
        "lists": ".episode-list:eq(#id) a"
    },

    // ============ 搜索 ============
    搜索: `js:
        // 先请求首页拿 t 参数
        let homeHtml = request(HOST + '/');
        let tMatch = homeHtml.match(/name="t"\\s+value="([^"]+)"/);
        let t = tMatch ? tMatch[1] : '';

        let searchUrl = HOST + '/search?k=' + encodeURIComponent(KEY) + '&t=' + encodeURIComponent(t);
        let html = request(searchUrl);

        let d = [];
        let items = pdfa(html, '.search-result-item');
        items.forEach(function(it) {
            let href = pd(it, 'a&&href', HOST);
            if (!href || href.indexOf('/detail/') === -1) return;
            let title = pdfh(it, '.title&&Text').trim();
            let pic = pd(it, '.search-result-item-pic img.lazyload&&data-original', HOST);
            let tags = pdfh(it, '.tags&&Text').trim().replace(/\\s+/g, ' ');
            d.push({
                vod_id: href,
                vod_name: title,
                vod_pic: pic,
                vod_remarks: tags
            });
        });
        VODS = d;
    `,

    // ============ 播放解析 ============
    lazy: `js:
        // ★ 硬编码你手动获取的 Cookie 值（会过期，但能临时用）
        let cookie = 'cdndefend_js_cookie=1624E4B40D8AC7D3CED5B2D34E0DA7DFCA45860F1658';
        let html = request(input, { headers: { 'Cookie': cookie } });

        let m = html.match(/src:\\s*["']([^"']+\\.m3u8[^"']*)["']/);
        if (m) input = m[1];
    `

};
