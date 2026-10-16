var rule = {
    title: '韩剧网(viprs4)',
    host: 'https://viprs4.cc',
    homeUrl: '/',
    url: '/fyclass.html?page=fypage',
    searchUrl: '/s.html?name=**&page=fypage',
    searchable: 2,
    quickSearch: 0,
    filterable: 1,
    headers: {
        'User-Agent': 'MOBILE_UA',
        'Referer': 'https://viprs4.cc/'
    },
    timeout: 8000,
    // 首页导航分类（写死，避开attack_key反爬）
    class_name: '电影&电视剧&综艺&动漫&短剧',
    class_url: 'dianying&dianshiju&zongyi&dongman&duanju',
    // 影片卡片选择器（适配该站 module-items 风格，用首页/分类页通用卡片）
    推荐: '.module-items;.module-poster-item, .myui-vodlist__box, .video-item, .card-item;a&&title||a&&Text;.lazyload&&data-original||img&&data-src||img&&src;.module-item-note&&Text||.pic-text&&Text;a&&href',
    一级: '.module-poster-item, .myui-vodlist__box, .video-item, .card-item;a&&title||a&&Text;.lazyload&&data-original||img&&data-src||img&&src;.module-item-note&&Text||.pic-text&&Text;a&&href',
    二级: {
        "title": "h1&&Text;.module-info-tag-link:eq(0)&&Text||a[href*=dianying],a[href*=dianshiju]&&Text",
        "img": ".module-item-pic&&img&&data-original||.lazyload&&data-original||.pic img&&src",
        "desc": ".module-info-item:eq(0)&&Text;.module-info-item:eq(1)&&Text;.module-info-item:eq(2)&&Text;.module-info-item:eq(3)&&Text",
        "content": ".module-info-introduction-content&&Text||.desc .sketch&&Text||.content&&Text",
        "tabs": ".module-tab-item.tab-item, .anthology-tab a, .tab-item",
        "lists": ".module-play-list:eq(#id) a, .anthology-list:eq(#id) a, .playlist:eq(#id) a"
    },
    搜索: '.module-card-item, .searchlist-item, .video-item, .card-item;a&&title||a&&Text;.lazyload&&data-original||img&&src;.module-item-note&&Text||.pic-text&&Text;a&&href',
    // 播放地址解析：该站播放页 /play/xxx.html 内嵌 window.xg_video_player_doc.aa
    // aa.url 是 /api/m3u8?origin=xxx&url=xxx，该接口 302 跳转到 box.dyrs.com.de 返回 m3u8
    play_parse: true,
    lazy: `js:
        let html = request(input);
        // 1) 先尝试 player_aaaa（兼容原555逻辑，以防该站后续切换）
        let m = html.match(/var player_aaaa\\s*=\\s*(\\{[\\s\\S]*?\\})\\s*<\\/script>/);
        if (m) {
            try {
                let d = JSON.parse(m[1]);
                let u = d.url || '';
                let e = Number(d.encrypt) || 0;
                if (e === 2) u = base64Decode(u);
                if (e === 1 || e === 2) u = unescape(u);
                input = u || input;
            } catch(e) {}
        }
        // 2) 该站实际播放器数据：window.xg_video_player_doc.aa.url
        m = html.match(/xg_video_player_doc\\s*=\\s*\\{[\\s\\S]*?aa\\s*:\\s*JSON\\.parse\\('(\\{[\\s\\S]*?\\})'\\)/);
        if (m) {
            try {
                let str = m[1].replace(/\\\\u0022/g,'"').replace(/\\\\\\//g,'/');
                let d = JSON.parse(str);
                let api = d.url || '';
                if (api) {
                    if (!api.startsWith('http')) api = rule.host + api;
                    // /api/m3u8 会302到 box.dyrs.com.de 再返回m3u8，直接把这个地址给播放器
                    // 播放器会跟随重定向拿到m3u8播放列表
                    input = {parse:0, url:api, jx:0};
                }
            } catch(e) {
                print('解析xg_player_doc出错:'+e.message);
            }
        }
    `
};
