var rule = {
    title: '毒舌电影',
    host: 'https://www.dushe05.com',
    homeUrl: '/',
    url: '',
    searchUrl: '/search?k=**&t=',
    searchable: 2,
    quickSearch: 0,
    filterable: 0,
    headers: {
        'User-Agent': 'MOBILE_UA',
        'Referer': 'https://www.dushe05.com/'
    },
    timeout: 30000,

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
        // 搜索需要先请求首页拿 t 参数
        let homeHtml = request(HOST + '/');
        let tMatch = homeHtml.match(/name="t"\\s+value="([^"]+)"/);
        let t = tMatch ? tMatch[1] : '';
        let searchUrl = HOST + '/search?k=' + encodeURIComponent(KEY) + '&t=' + encodeURIComponent(t);
        console.log('[毒舌] 搜索 URL: ' + searchUrl);
        let html = request(searchUrl);
        console.log('[毒舌] 搜索页长度: ' + html.length);
        console.log('[毒舌] 搜索结果数量: ' + pdfa(html, '.search-result-item').length);
        let d = [];
        // 搜索结果页的卡片是 .search-result-item
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
        let html = request(input);
        console.log('[毒舌] 播放页长度: ' + html.length);
        // 播放页地址通常在 window.__NUXT__ 或 script 变量里
        let m = html.match(/https?:\\/\\/[^"'\\s]+\\.m3u8[^"'\\s]*/);
        console.log('[毒舌] m3u8 匹配: ' + (m ? m[0] : '未匹配'));
        if (m) {
            input = m[0];
        } else {
            // 备选：从 player_aaaa 或类似变量里提取
            let m2 = html.match(/url\\s*:\\s*["']([^"']+\\.m3u8[^"']*)["']/);
            if (m2) input = m2[1];
        }
    `
};
