var rule = {
    title:'绿色影视',
    host:'https://www.lvsc168.com',
    url:'/frim/fyclass-fypage.html',
    searchUrl:'/search.php?searchword=**&page=fypage',
    searchable:2,
    quickSearch:0,
    filterable:0,
    headers:{
        'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer':'https://www.lvsc168.com/'
    },
    class_name:'电影&电视剧&综艺&动漫&短剧',
    class_url:'1&2&3&4&26',
    img: ';/img\\.php\\?url=(*)',
    一级:'.myui-vodlist__box;a&&title;a.myui-vodlist__thumb&&data-original;.pic-text&&Text;a.myui-vodlist__thumb&&href',
    二级:{
        "title":"h1.title&&Text",
        "img":".myui-content__thumb .lazyload&&data-original",
        "desc":".myui-content__detail p&&Text;.text-muted&&Text",
        "desc":"h1.title font&&Text;.data&&Text;.data:eq(1)&&Text;.data:eq(2)&&Text",
        "content":".sketch&&Text",
        "tabs":".nav-tabs:eq(0) li a[href^='#playlist']",
        "lists":"#fyid li a",
    },
    search:'.searchlist li;a&&title;.lazyload&&data-original;.other&&Text;a&&href',
    lazy:'js:\nvar html=request(input);\nvar now=html.match(/var now="([^"]+)"/);\nif(!now)return "";\nvar shareUrl=Base64.decode(now[1]);\nlog("shareUrl:"+shareUrl);\nvar shareHtml=request(shareUrl);\nvar redirecturl=shareHtml.match(/var redirecturl="([^"]+)"/);\nvar main=shareHtml.match(/var main="([^"]+)"/);\nif(redirecturl&&main){\n  var url=redirecturl[1]+main[1];\n  log("play url:"+url);\n  return {parse:0,jx:0,url:url}\n}\nreturn "";'
}
