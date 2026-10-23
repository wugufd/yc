var rule = {
    title: '网飞猫1',
    host: 'https://www.ncat2.com',
    homeUrl: '/',
    searchUrl: '/index.php/vod/search.html?wd=**&page=fypage',
    searchable: 1, // 1=开启搜索
    quickSearch: 1,
    filterable: 0,
    headers: {
        'User-Agent': 'Mozilla/5.0 (Linux; Android 11; M2007J3SC Build/RKQ1.200826.002; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/90.0.4430.91 Mobile Safari/537.36',
        'Referer': 'https://www.ncat2.com/'
    },
    搜索: '.module-items .module-card-item;.module-card-item-title strong&&Text;.module-card-item-pic img&&data-original;.module-card-item-info p:eq(-1)&&Text;a.module-card-item-pic&&href',
    二级: {
        title: 'h1&&Text',
        img: '.module-info-pic img&&data-original',
        desc: '.module-info-introduction p&&Text',
        content: '.module-info-introduction&&Text',
        tabs: '.module-tab-item.tab-item',
        lists: '.module-play-list:eq(#id) a'
    },
    lazy: `js:
        let html = request(input);
        let aaaa = html.match(/var player_aaaa=(\\{[^<]+\\})/);
        if (aaaa) {
            let data = JSON.parse(aaaa[1]);
            let url = data.url;
            if (data.encrypt == 2) {
                url = CryptoJS.enc.Utf8.stringify(CryptoJS.enc.Base64.parse(url));
                url = unescape(url);
            } else if (data.encrypt == 1) {
                url = unescape(url);
            }
            return {parse: 0, url: url};
        }
        return input;
    `
}
