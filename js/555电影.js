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
        'User-Agent': 'MOBILE_UA'
    },
    timeout: 5000,
    //class_parse: '.navbar-items li:gt(0):lt(8);a&&Text;a&&href;.*/(.*?).html',
    class_name: 'Netflix&电影&连续剧&动漫&综艺纪录',
    class_url: '/label/netflix.html&1&2&4&3',
    play_parse: true,
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
    `,

    推荐: '.module-items:eq(0);.module-poster-item;.module-poster-item-title&&Text;.lazyload&&data-original;.module-item-note&&Text;a&&href',
    一级: '.module-poster-item;.module-poster-item-title&&Text;.lazyload&&data-original;.module-item-note&&Text;a&&href',
    二级: {
        "title": "h1&&Text;.module-info-tag-link:eq(0)&&Text",
        "img": ".module-item-pic&&img&&data-original",
        "desc": ".module-info-item:eq(4)&&Text;.module-info-item:eq(3)&&Text;.module-info-item:eq(2)&&Text;.module-info-item:eq(1)&&Text",
        "content": ".module-info-introduction-content&&Text",
        "tabs": ".module-tab-item.tab-item",
        "lists": ".module-play-list:eq(#id) a"
    },
    搜索: '.module-card-item;.module-card-item-title&&Text;.lazyload&&data-original;.module-item-note&&Text;a&&href'
};
