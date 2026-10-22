var rule = {
    title: '绿色影视',
    host: 'https://www.lvsc168.com',
    url: '/frim/fyclass-fypage.html',
    searchUrl: '/search.php?page=fypage&searchword=**',
    searchable: 2,
    quickSearch: 0,
    filterable: 0,
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://www.lvsc168.com/'
    },
    class_name: '电影&电视剧&综艺&动漫&短剧',
    class_url: '1&2&3&4&26',
    play_parse: true,
    lazy: `js:
        var html = request(input);
        var b64 = html.match(/var now=base64decode\\("([^"]+)"\\)/);
        if(!b64){return input;}
        var shareUrl = base64Decode(b64[1]);
        var shareHtml = request(shareUrl, {headers:{'Referer':'https://www.lvsc168.com/'}});
        var domain = shareHtml.match(/var redirecturl\\s*=\\s*"([^"]+)"/);
        var path = shareHtml.match(/var main\\s*=\\s*"([^"]+)"/);
        if(domain && path){
            var realUrl = domain[1] + path[1].replace(/\\\\\\//g,'/');
            return {parse:0, jx:0, url: realUrl};
        }
        return input;
    `,
    一级: '.myui-vodlist__box;h4.title a&&Text;a.myui-vodlist__thumb&&style;.pic-text&&Text;h4.title a&&href',
    二级: {
        title: 'h1&&Text',
        img: '.myui-content__thumb .lazyload&&data-original',
        desc: '.sketch&&Text',
        tabs: '.nav-tabs:eq(0) li a[href^="#playlist"]',
        lists: '.tab-content .tab-pane:eq(#id) ul li a'
    },
    搜索: '#searchList li;h4.title a&&Text;.thumb a&&data-original;;.thumb a&&href',
    img: ';/img\\.php\\?url=(.*?)(?:\\)|["&])',
};
