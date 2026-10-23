var rule = {
    title: "网飞猫",
    host: "https://www.ncat2.com",
    // drpy标准分页格式：[第一页URL]分页URL，第一页不带page，第二页开始带/page/fypage
    url: "/index.php/vod/show/id/fyclass.html[/index.php/vod/show/id/fyclass/page/fypage.html]",
    searchUrl: "/index.php/vod/search.html;post#wd=**&page=fypage",
    searchable: 1,
    quickSearch: 0,
    filterable: 0,
    headers: {
        "User-Agent": "MOBILE_UA",
        "Referer": "https://www.ncat2.com/"
    },
    class_name: "电影&电视剧&综艺&动漫",
    class_url: "1&2&3&4",
    // 一级五段式：容器;标题;图片;备注;链接（严格按引擎顺序）
    一级: ".module-poster-item.module-item;.module-poster-item-title&&Text;.module-item-pic img&&data-original;.module-item-note&&Text;a&&href",
    搜索: ".module-poster-item.module-item;.module-poster-item-title&&Text;.module-item-pic img&&data-original;.module-item-note&&Text;a&&href",
    二级: {
        title: "h1&&Text",
        img: ".module-item-pic img&&data-original",
        desc: ".module-info-item:eq(0)&&Text;.module-info-item:eq(1)&&Text;.module-info-item:eq(2)&&Text;.module-info-item:eq(3)&&Text",
        content: ".module-info-introduction&&Text",
        tabs: ".module-tab-item.tab-item",
        lists: ".module-play-list:eq(#id) a"
    },
    lazy: `js:
        let html = request(input);
        let aaaa = html.match(/player_aaaa=({[\\s\\S]*?})</);
        if (aaaa) {
            let json = JSON.parse(aaaa[1].trim());
            if (json.encrypt == 2) {
                let playUrl = unescape(base64Decode(json.url));
                input = {parse:0, jx:0, url: playUrl};
            }
        }
    `,
    play_parse: true,
    parse: 0,
    jx: 0
};
