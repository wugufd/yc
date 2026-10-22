var rule = {
    title:'绿色影视',
    host:'https://www.lvsc168.com',
    homeUrl:'/frim/1-1.html',
    url:'/frim/fyclass-fypage.html',
    searchUrl:'/search.php?searchword=**&page=fypage',
    searchable:2,
    quickSearch:0,
    headers:{
        'User-Agent':'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15'
    },
    class_name:'电影&电视剧&综艺&动漫&短剧',
    class_url:'1&2&3&4&26',
    play_parse:true,
    lazy:'',
    class_parse:'.nav-menu li;a&&Text;a&&href;/frim/(\\d+)-1.html',
    cate_exclude:'',
    推荐:'.myui-vodlist__box;a&&title;a&&data-original;.pic-tag&&Text;a&&href;/movie/(\\d+).html;img:;/img\\.php\\?url=(*)',
    一级:'.myui-vodlist__box;a&&title;a&&data-original;.pic-tag&&Text;a&&href;/movie/(\\d+).html;img:;/img\\.php\\?url=(*)',
    二级:{
        "title":".title&&Text;.title font&&Text",
        "img":".lazyload&&data-original;img:;/img\\.php\\?url=(*)",
        "desc":".content-info .text-muted:eq(3)&&Text;.content-info p:eq(2)&&Text",
        "content":".sketch&&Text",
        "tabs":".myui-panel_bd .nav-tabs li a[href^=\\"#playlist\\"]",
        "lists":".tab-content .tab-pane:eq(#id) li a"
    },
    搜索:{
        "title":".title a&&Text",
        "img":".thumb a&&data-original;img:;/img\\.php\\?url=(*)",
        "desc":"",
        "url":".thumb a&&href"
    },
    lazy:js: function(input) {
      // 直接用lists返回的完整href（自带正确sid和nid）
      var playUrl = input.startsWith('http') ? input : (this.host + input);
      var html = request(playUrl, {headers: this.headers});
      // 第一步：base64解码now获取share页面URL
      var m = html.match(/var now\s*=\s*base64decode\("([A-Za-z0-9+/=]+)"\)/);
      if (!m) return '';
      var shareUrl = Base64.decode(m[1]);
      // 第二步：访问share页面，拼接redirecturl + main得到真实m3u8
      var shareHtml = request(shareUrl, {headers: Object.assign({'Referer': playUrl}, this.headers)});
      var m1 = shareHtml.match(/var\s+redirecturl\s*=\s*"([^"]+)"/);
      var m2 = shareHtml.match(/var\s+main\s*=\s*"([^"]+)"/);
      if (m1 && m2) {
        var realUrl = m1[1] + m2[1];
        return {parse: 0, url: realUrl, jx: 0};
      }
      return {parse:0, url: shareUrl, jx:0};
    }
}
