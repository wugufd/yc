var rule = {
    title: '绿色影视',
    host: 'https://www.lvsc168.com',
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
    // 图片代理正则：自动提取/img.php?url=后面的真实图床地址
    img: ';/img\\.php\\?url=(*)',
    // 一级分类列表：图片属性在a.myui-vodlist__thumb的data-original上
    一级: '.myui-vodlist li;a&&title;a&&data-original;.pic-tag&&Text;a&&href;.pic-text&&Text',
    // 首页推荐同分类列表
    推荐: '.myui-vodlist li;a&&title;a&&data-original;.pic-tag&&Text;a&&href;.pic-text&&Text',
    // 搜索结果列表（列表项在#searchList下，图片同样在a.thumb的data-original）
    搜索: '#searchList li;a&&title;.thumb a&&data-original;.pic-tag&&Text;.thumb a&&href;.pic-text&&Text',
    // 二级详情页
    二级: {
        title: 'h1.title&&Text;.myui-content__detail h1&&Text',
        img: '.myui-content__thumb img&&data-original',
        desc: '.desc&&Text;.sketch&&Text',
        content: '.sketch&&Text',
        // 播放线路：只取前2个高速/高速2，过滤后面"同类型"推荐tab
        tabs: '.myui-panel_bd .nav-tabs:eq(0) li',
        // 集数列表：drpy自动将#id替换为1/2，对应playlist1/playlist2
        lists: '#playlist#id li',
    },
    // 播放页解密：真实只有一步base64解密 var now=base64decode("xxx") 即得到m3u8
    lazy: function () {
        let { input, html } = this;
        let m = html.match(/var\s+now\s*=\s*base64decode\(\s*["']([A-Za-z0-9+/=]+)["']\s*\)/);
        if (m) {
            let url = atob(m[1]);
            input = { url: url, parse: 0, jx: 0 };
        } else {
            input = { parse: 0, jx: 0 };
        }
    }
};
