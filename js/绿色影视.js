var rule = {
    title: '绿色影视',
    host: 'https://www.lvsc168.com',
    url: '/frim/fyclass-fypage.html',
    searchUrl: '/search.php?searchword=**&page=fypage',
    searchable: 2,
    quickSearch: 0,
    filterable: 0,
    headers: {
        'User-Agent': 'Mozilla/5.0 (Linux; Android 11; Pixel 5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.91 Mobile Safari/537.36',
        'Referer': 'https://www.lvsc168.com/'
    },
    class_name: '电影&电视剧&综艺&动漫&短剧',
    class_url: '1&2&3&4&26',
    play_parse: true,
    lazy: `js:
var html = request(input, {headers: rule.headers});
// 1. 提取now变量(base64加密的share地址)
var m = html.match(/var\\s+now\\s*=\\s*base64decode\\("([^"]+)"\\)/);
if (m) {
    var share_url = atob(m[1]);
    // share页内var redirecturl + var main拼接真实m3u8
    var share_html = request(share_url, {headers: {'User-Agent': rule.headers['User-Agent'], 'Referer': 'https://www.lvsc168.com/'}});
    var host_m = share_html.match(/var\\s+redirecturl\\s*=\\s*"([^"]+)"/);
    var main_m = share_html.match(/var\\s+main\\s*=\\s*"([^"]+)"/);
    if (host_m && main_m) {
        input = host_m[1] + main_m[1].replace(/\\\//g, '/');
    } else {
        input = share_url;
    }
} else {
    // 2. 兼容苹果CMS标准player_aaaa
    var p = html.match(/var\\s+player_aaaa\\s*=\\s*(\\{[\\s\\S]*?\\});/);
    if (p) {
        eval('var obj=' + p[1]);
        var u = obj.url || '';
        if (obj.encrypt == 2) { u = unescape(atob(u)); }
        else if (obj.encrypt == 1) { u = unescape(u); }
        input = u;
    }
}
`,
    推荐: '.myui-vodlist__box;a&&title;.myui-vodlist__thumb&&data-original;/img\\.php\\?url=(*);.pic-tag&&Text;a&&href',
    一级: '.myui-vodlist__box;a&&title;.myui-vodlist__thumb&&data-original;/img\\.php\\?url=(*);.pic-text.text-right&&Text;a&&href',
    二级: {
        title: 'h1.title&&Text',
        img: '.myui-content__thumb .lazyload&&data-original;/img\\.php\\?url=(*)',
        desc: '.myui-content__detail p.data&&Text',
        content: '.sketch&&Text',
        tabs: 'ul.nav.nav-tabs li a[href^="#playlist"]&&Text',
        lists: '.tab-pane:eq(#id) li a',
        tab_text: 'a',
        list_text: 'a&&Text;a&&href'
    },
    搜索: '#searchList li.clearfix;h4.title a&&Text;.myui-vodlist__thumb&&data-original;/img\\.php\\?url=(*);.pic-text.text-right&&Text;h4.title a&&href',
}
