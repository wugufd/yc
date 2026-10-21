var rule = {
    title: '绿色影视1',
    host: 'https://www.lvsc168.com',
    // 首页分类（电影/电视剧/综艺/动漫/短剧）
    class_name: '电影&电视剧&综艺&动漫&短剧',
    class_url: '1&2&3&4&26',
    homeUrl: '/',
    url: '/frim/fyclass-fypage.html',
    searchUrl: '/search.php?searchword=**&page=fypage',
    searchable: 2,
    quickSearch: 0,
    filterable: 0,
    headers: {
        'User-Agent': 'Mozilla/5.0 (Linux; Android 13; SM-G996B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
        'Referer': 'https://www.lvsc168.com/'
    },
    // 图片代理正则：提取/img.php?url=后的真实地址
    img: ';/img\\.php\\?url=(*)',
    // 一级分类列表
    一级: '.myui-vodlist__box;a&&title;img&&data-original;.pic-tag&&Text;a&&href;.pic-text&&Text',
    // 首页推荐（同分类列表）
    推荐: '.myui-vodlist__box;a&&title;img&&data-original;.pic-tag&&Text;a&&href;.pic-text&&Text',
    // 搜索结果列表（卡片式）
    搜索: '#searchList li;a&&title;.lazyload&&data-original;.pic-tag&&Text;a&&href;.pic-text&&Text',
    // 二级详情页
    二级: {
        title: 'h1.title&&Text;.myui-content__detail h1&&Text',
        img: '.myui-content__thumb img&&data-original',
        desc: '.desc&&Text;.sketch&&Text',
        content: '.sketch&&Text',
        tabs: '.myui-panel_bd .nav-tabs:eq(0) li a',
        lists: '#playlist#id li a',
        tab_text: 'body&&Text',
        list_text: 'body&&Text',
        list_url: 'a&&href'
    },
    // 播放页解密
    lazy: async function () {
        let { input, html } = this;
        // 直接提取 var now=base64decode("xxx") 一步解密
        let m = html.match(/var\s+now\s*=\s*base64decode\(\s*["']([A-Za-z0-9+/=]+)["']\s*\)/);
        if (m) {
            let url = atob(m[1]);
            input = { url: url, jx: 0, parse: 0 };
        } else {
            input = { url: '', jx: 0, parse: 0 };
        }
    }
};
