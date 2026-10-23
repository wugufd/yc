var rule = {
    title: '网飞猫',
    host: 'https://www.ncat2.com',
    url: '/index.php/vod/show/id/fyclass/page/fypage.html',
    searchUrl: '/index.php/vod/search/**----------fypage---.html',
    searchable: 1,
    quickSearch: 0,
    filterable: 0,
    headers: {
        'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
        'Referer': 'https://www.ncat2.com/'
    },
    class_parse: '',
    play_parse: true,
    lazy: `js:
        let html = request(input);
        let aaaa = html.match(/var player_aaaa=({[\s\S]*?})</)[1];
        let obj = JSON.parse(aaaa);
        let playUrl = obj.url;
        if (obj.encrypt == '2') playUrl = unescape(base64Decode(playUrl));
        else if (obj.encrypt == '1') playUrl = unescape(playUrl);
        if (playUrl.startsWith('http')) input = {parse:0, jx:0, url: playUrl};
    `,
    二级: {
        title: 'h1&&Text',
        img: '.module-item-img img&&data-original;.module-item-pic img&&data-original;img&&src',
        desc: '.module-info-item:eq(2)&&Text;.vod-detail-content&&Text',
        tabs: '.module-tab-item.tab-item',
        lists: '.module-play-list:eq(#id) a'
    },
    搜索: '.module-card-item.module-item;.module-card-item-title a&&Text;.module-item-img img&&data-original;.module-item-note&&Text;.module-card-item-title a&&href',
}
