var rule = {
    类型:'影视',
    标题:'绿色影视',
    编码:'utf-8',
    首页:'https://www.lvsc168.com',
    host:'https://www.lvsc168.com',
    url:'/frim/fyclass-fypage.html',
    searchUrl:'/search.php?searchword=**&page=fypage',
    headers:{
        'User-Agent':'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer':'https://www.lvsc168.com/'
    },
    class_name:'电影&电视剧&综艺&动漫&短剧',
    class_url:'1&2&3&4&26',
    img: ';/img\\.php\\?url=(*)',
    一级:'.myui-vodlist__box;.myui-vodlist__thumb&&title;.myui-vodlist__thumb&&style;.pic-text&&Text;.myui-vodlist__thumb&&href',
    二级:{
        "title":"h1.title&&Text",
        "img":".myui-content__thumb img&&data-original",
        "desc":".sketch&&Text",
        "content":".sketch&&Text",
        "tabs":".myui-panel_hd .nav-tabs li",
        "lists":"#playlist#id ul.myui-content__list li a"
    },
    搜索:'#searchList li;.detail h4 a&&Text;.thumb a&&data-original;.pic-text&&Text;.thumb a&&href',
    lazy:String(function() {
        let html = request(input);
        let nowMatch = html.match(/var now=base64decode\("([^"]+)"\)/);
        if(!nowMatch) return '';
        let shareUrl = atob(nowMatch[1]);
        let shareHtml = request(shareUrl);
        let domainMatch = shareHtml.match(/var redirecturl\s*=\s*"([^"]+)"/);
        let mainMatch = shareHtml.match(/var main\s*=\s*"([^"]+)"/);
        if(!domainMatch || !mainMatch) return '';
        let domain = domainMatch[1];
        let path = mainMatch[1].replace(/\\\//g,'/');
        let playUrl = domain + path;
        return {
            parse:0,
            url:playUrl,
            header:{'Referer':shareUrl}
        }
    })
};
