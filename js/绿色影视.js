var rule = {
    title:'绿色影视',
    host:'https://www.lvsc168.com',
    url:'/frim/fyclass-fypage.html',
    searchUrl:'/search.php?searchword=**&page=fypage',
    searchable:2,
    quickSearch:0,
    filterable:0,
    headers:{
        'User-Agent':'MOBILE_UA',
        'Referer':'https://www.lvsc168.com/'
    },
    class_name:'电影&电视剧&综艺&动漫&短剧',
    class_url:'1&2&3&4&26',
    img:';/img\\.php\\?url=(*)',
    play_parse:true,
    lazy:`js:
let html = request(input);
let m = html.match(/var now=base64decode\\("([^"]+)"\\)/);
if(!m){return {parse:0,jx:0,url:input};}
let share = base64Decode(m[1]);
log("share:"+share);
let sh = request(share,{headers:{"Referer":"https://www.lvsc168.com/"}});
let dom = sh.match(/var redirecturl = "([^"]+)"/);
let mn  = sh.match(/var main = "([^"]+)"/);
if(!dom||!mn){return {parse:0,jx:0,url:input};}
let main = mn[1].replace(/\\\\\\//g,"/");
let playUrl = dom[1]+main;
log("播放地址:"+playUrl);
return {parse:0,jx:0,url:playUrl,header:JSON.stringify({Referer:share})};
`,
    一级:'.myui-vodlist li;h3.title a&&Text;a.myui-vodlist__thumb&&data-original;.pic-text&&Text;h3.title a&&href',
    二级:{
        "title":"h1.title&&Text",
        "img":".myui-content__thumb .lazyload&&data-original",
        "desc":"p.data:eq(0)&&Text",
        "content":".content&&Text",
        "tabs":".myui-panel_bd .nav-tabs li a[href^='#playlist']",
        "lists":".tab-content .tab-pane:eq(#id) ul li a"
    },
    搜索:'#searchList li.clearfix;.detail .title a&&Text;.thumb a&&data-original;.detail p.text-muted:eq(0)&&Text;.thumb a&&href'
};
