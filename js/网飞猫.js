var rule = {
    类型: '影视',
    title: '网飞猫',
    host: 'https://www.ncat2.com',
    class_name: '电影&电视剧&综艺&动漫',
    class_url: '1&2&3&4',
    searchable: 1,
    quickSearch: 1,
    filterable: 1,
    play_parse: true,
    double: false,
    headers: {
        'User-Agent': 'Mozilla/5.0 (Linux; Android 12; M2012K11AC Build/SKQ1.211006.001; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/97.0.4692.98 Mobile Safari/537.36',
        'Referer': 'https://www.ncat2.com/'
    },
    url: '/index.php/vod/show/id/fyclass.html[/index.php/vod/show/id/fyclass/page/fypage.html]',
    searchUrl: '/index.php/vodsearch/**----------fypage---.html',
    searchable:1,
    一级: '.module-items .module-poster-item.module-item;.module-poster-item-title&&Text;.module-item-pic img&&data-original;.module-item-note&&Text;a&&href',
    二级: {
        title: 'h1&&Text',
        img: '.module-item-pic img&&data-original',
        desc: '.vod-content .module-info-content&&Text',
        tabs: '.module-tab .module-tab-items .module-tab-item',
        lists: '#fyid .module-play-list-link',
    },
    lazy: `js:
        let html = getHtml(input);
        let player = html.match(/player_aaaa=(\\{.*?\\})<\\/script>/);
        if(!player) return input;
        try{
            let data = JSON.parse(player[1]);
            let url = data.url;
            if(data.encrypt==='2'){
                url = unescape(base64Decode(url));
            }
            return {parse:0,jx:0,url:url};
        }catch(e){
            return input;
        }
    `
};
