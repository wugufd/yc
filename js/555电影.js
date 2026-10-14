var rule = {
    title: '555电影',
    host: 'https://555k27.com',
    homeUrl: '/index/home.html',
    url: '/vodtype/fyclass-fypage.html',
    searchUrl: '/vodsearch/**----------fypage---.html',
    searchable: 2,
    quickSearch: 0,
    filterable: 1,
    headers: {
        'User-Agent': 'MOBILE_UA',
        'Referer': 'https://555k27.com/'
    },
    timeout: 5000,
    class_name: 'Netflix&电影&连续剧&动漫&综艺纪录',
    class_url: '/label/netflix.html&1&2&4&3',

    // 一级列表：用 js 动态处理 Netflix 和标准分类
    一级: `js:
        let d = [];
        let html = '';
        // 判断是否是 Netflix 分类
        let isNetflix = MY_CATE === '/label/netflix.html' || MY_CATE.includes('netflix');

        if (isNetflix) {
            // Netflix 分页格式: /label/netflix/page/N.html
            let pageUrl = 'https://555k27.com/label/netflix/page/' + MY_PAGE + '.html';
            html = request(pageUrl);
        } else {
            // 标准分类直接请求 input
            html = request(input);
        }

        let items = pdfa(html, '.module-poster-item');
        items.forEach(it => {
            let title = pdfh(it, '.module-poster-item-title&&Text');
            let pic = pd(it, '.lazyload&&data-original', HOST);
            let desc = pdfh(it, '.module-item-note&&Text');
            let href = pd(it, 'a&&href', HOST);
            d.push({
                vod_id: href,
                vod_name: title,
                vod_pic: pic,
                vod_remarks: desc
            });
        });
        VODS = d;
    `,

    推荐: '.module-items:eq(0);.module-poster-item;.module-poster-item-title&&Text;.lazyload&&data-original;.module-item-note&&Text;a&&href',

    二级: {
        "title": "h1&&Text;.module-info-tag-link:eq(0)&&Text",
        "img": ".module-item-pic&&img&&data-original",
        "desc": ".module-info-item:eq(4)&&Text;.module-info-item:eq(3)&&Text;.module-info-item:eq(2)&&Text;.module-info-item:eq(1)&&Text",
        "content": ".module-info-introduction-content&&Text",
        "tabs": ".module-tab-item.tab-item",
        "lists": ".module-play-list:eq(#id) a"
    },

    搜索: '.module-card-item;.module-card-item-title&&Text;.lazyload&&data-original;.module-item-note&&Text;a&&href',

    lazy: `js:
        let html = request(input);
        let match = html.match(/var player_aaaa\\s*=\\s*(\\{.*?\\})\\s*<\\/script>/s);
        if (match) {
            try {
                let data = JSON.parse(match[1]);
                let url = data.url || '';
                let encrypt = Number(data.encrypt) || 0;
                if (encrypt === 2) url = base64Decode(url);
                if (encrypt === 1 || encrypt === 2) url = unescape(url);
                input = url || input;
            } catch (e) {}
        }
    `
};
