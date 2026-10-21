var rule = {
    title: '飞快TV1',
    host: 'https://feikuai.in',
    url: '/vodshow/fyclass-----------fypage.html',
    searchUrl: '/vodsearch/**----------fypage---.html',
    searchable: 2,
    quickSearch: 0,
    filterable: 0,
    headers: {
        'User-Agent': 'MOBILE_UA',
        'Referer': 'https://feikuai.in/'
    },
    timeout: 30000,
    class_name: '电影&剧集&综艺&动漫',
    class_url: '1&2&3&4',

    // 一级列表（分类页）：
    // 实测分类页DOM：<a href="/voddetail/xxx.html" title="片名" class="module-poster-item module-item">
    //   <div class="module-item-cover"><div class="module-item-note">HD</div><div class="module-item-pic"><img data-original="..." ...></div></div>
    //   <div class="module-poster-item-info"><div class="module-poster-item-title">片名</div></div>
    // </a>
    一级: '.module-poster-item.module-item;.module-poster-item-title&&Text;img&&data-original;.module-item-note&&Text;a&&href',

    // 首页推荐：沿用与一级相同的海报选择器
    推荐: '.module-poster-item.module-item;.module-poster-item-title&&Text;img&&data-original;.module-item-note&&Text;a&&href',

    // 二级详情
    // title: h1标签片名；img: 海报img的data-original；desc: 简介；
    // tabs: 播放线路tab（drpy会自动跳过第一个默认激活，取span文本作为线路名）；
    // lists: 对应线路下的剧集链接 a，drpy自动取 a 的 text/href
    二级: {
        "title": "h1&&Text",
        "img": ".module-info-poster img&&data-original",
        "desc": ".module-info-introduction-content&&Text",
        "content": ".module-info-item:contains(导演)&&Text;.module-info-item:contains(主演)&&Text",
        "tabs": ".module-tab-item.tab-item",
        "lists": ".module-play-list:eq(#id) a"
    },

    // 搜索结果卡片结构：
    // <div class="module-card-item module-item">
    //   <div class="module-card-item-class">电影</div>
    //   <a href="/voddetail/xxx.html" class="module-card-item-poster">...<img data-original="..."></a>
    //   <div class="module-card-item-info">...<strong>片名</strong>...</div>
    // </div>
    搜索: '.module-card-item.module-item;.module-card-item-title strong&&Text;img&&data-original;.module-item-note&&Text;a.module-card-item-poster&&href',

    // 三级播放解析：标准苹果CMS player_aaaa
    lazy: `js:
        let html = request(input);
        let match = html.match(/var\\s+player_aaaa\\s*=\\s*(\\{.*?\\})\\s*<\\/script>/s);
        if (match) {
            try {
                let data = JSON.parse(match[1]);
                let url = data.url || '';
                let encrypt = Number(data.encrypt) || 0;
                if (encrypt === 2) url = base64Decode(url);
                if (encrypt === 1 || encrypt === 2) url = unescape(url);
                input = url || input;
            } catch (e) {}
        }
    `
};
