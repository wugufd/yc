var rule = {
    title: '网飞猫',
    host: 'https://www.ncat2.com',
    url: '/index.php/vod/show/id/fyclass.html',
    searchUrl: '/index.php/vodsearch/**----------fypage---.html',
    searchable: 1,
    quickSearch: 0,
    filterable: 0,
    class_name: '电影&电视剧&综艺&动漫',
    class_url: '1&2&3&4',
    class_parse: true,
    headers: {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
        'Referer': 'https://www.ncat2.com/'
    },
    timeout: 5000,
    play_parse: true,
    parse: 0,
    jx: 0,
    一级: '.module-poster-item.module-item;a&&title;a&&data-original;.module-item-note&&Text;a&&href',
    二级: {
        title: 'h1&&Text',
        img: '.module-info-pic img&&data-original',
        desc: '.module-info-introduction&&Text',
        tabs: '.module-tab-item.tab-item',
        lists: '.module-play-list:eq(#id) a'
    },
    lazy: `js:
    var html = request(input);
    var m = html.match(/var player_aaaa=({.*?})</script>/);
    if(!m) return input;
    var playJson = JSON.parse(m[1]);
    if(playJson.encrypt && playJson.encrypt == '2'){
        playJson.url = unescape(base64Decode(playJson.url));
    }
    return {parse:0, jx:0, url: playJson.url};
    `
};
