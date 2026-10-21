var rule = {
    title: '飞快TV',
    host: 'https://feikuai.in',
    homeUrl: '/',
    url: '/vodshow/fyclass--------fypage---.html',
    searchUrl: '/vodsearch/-------------fypage---.html?wd=**',
    searchable: 2,
    quickSearch: 0,
    filterable: 1,
    headers: {
        'User-Agent': 'MOBILE_UA',
        'Referer': 'https://feikuai.in/'
    },
    timeout: 30000,
    class_name: '电影&剧集&综艺&动漫',
    class_url: '1&2&3&4',

    // 一级列表：标准苹果CMS mxpro主题海报列表
    一级: '.module-items:eq(0);.module-poster-item.module-item;.module-poster-item-title&&Text;.module-item-pic&&img&&data-original;.module-item-note&&Text;a&&href',

    // 首页推荐：同列表结构
    推荐: '.module-items:eq(0);.module-poster-item.module-item;.module-poster-item-title&&Text;.module-item-pic&&img&&data-original;.module-item-note&&Text;a&&href',

    // 二级详情：使用js动态提取，适配该主题不固定的info-item顺序
    二级: `js:
        let html = request(input);
        let data = {};

        // 标题
        data.vod_name = pdfh(html, 'h1&&Text').replace(/\\s+/g, '').trim();

        // 封面图片
        data.vod_pic = pd(html, '.module-info-poster&&img&&data-original', input);

        // 类型（第一个tag链接）
        let typeTags = pdfa(html, '.module-info-tag-link');
        data.type_name = typeTags && typeTags.length > 0 ? pdfh(typeTags[0], 'a&&Text').trim() : '';

        // 简介
        data.vod_content = pdfh(html, '.module-info-introduction-content&&Text').replace(/\\s+/g, ' ').trim();

        // 遍历info-item提取导演、主演、状态等信息
        let vod_director = '';
        let vod_actor = '';
        let vod_remarks = '';
        let vod_year = '';
        let vod_area = '';

        let items = pdfa(html, '.module-info-item');
        items.forEach(function(it) {
            let text = pdfh(it, '&&Text').replace(/\\s+/g, ' ').trim();
            if (text.indexOf('导演') > -1) {
                vod_director = text.replace(/导演[：:]\\s*/, '').trim();
            } else if (text.indexOf('主演') > -1) {
                vod_actor = text.replace(/主演[：:]\\s*/, '').trim();
            } else if (text.indexOf('状态') > -1) {
                vod_remarks = text.replace(/状态[：:]\\s*/, '').trim();
            } else if (text.indexOf('上映') > -1) {
                let yearMatch = text.match(/(\\d{4})/);
                vod_year = yearMatch ? yearMatch[1] : '';
            }
        });

        // 年份也可以从顶部tag取
        if (!vod_year) {
            let firstTag = pdfh(html, '.module-info-tag-link:eq(0)&&Text').trim();
            if (/^\\d{4}$/.test(firstTag)) vod_year = firstTag;
        }

        // 地区从第二个tag取
        let areaTag = pdfh(html, '.module-info-tag-link:eq(1)&&Text').trim();
        vod_area = areaTag && !/^\\d{4}$/.test(areaTag) ? areaTag : '';

        data.vod_director = vod_director;
        data.vod_actor = vod_actor;
        data.vod_remarks = vod_remarks;
        data.vod_year = vod_year;
        data.vod_area = vod_area;

        // 播放线路标签
        let playFrom = [];
        let tabs = pdfa(html, '.module-tab-item.tab-item');
        tabs.forEach(function(tab) {
            let name = pdfh(tab, 'span&&Text').trim();
            if (name) playFrom.push(name);
        });
        if (playFrom.length === 0) playFrom = ['飞快TV'];
        data.vod_play_from = playFrom.join('$$$');

        // 每个线路对应的播放列表
        let playUrlList = [];
        let lists = pdfa(html, '.module-play-list');
        lists.forEach(function(list, idx) {
            if (idx >= playFrom.length) return;
            let links = pdfa(list, 'a');
            let episodes = [];
            links.forEach(function(a) {
                let epName = pdfh(a, 'span&&Text').trim();
                let epUrl = pd(a, 'a&&href', input);
                if (epName && epUrl) episodes.push(epName + '$' + epUrl);
            });
            playUrlList.push(episodes.join('#'));
        });
        data.vod_play_url = playUrlList.join('$$$');

        VOD = data;
    `,

    // 搜索：卡片式列表结构
    搜索: '.module-card-item.module-item;.module-card-item-title&&Text;.module-card-item-poster&&img&&data-original;.module-item-note&&Text;a&&href',

    // 播放地址解密：标准苹果CMS player_aaaa encrypt=2
    lazy: `js:
        let html = request(input);
        let match = html.match(/var player_aaaa\\s*=\\s*(\\{.*?\\})\\s*<\\/script>/s);
        if (match) {
            try {
                let playerData = JSON.parse(match[1]);
                let url = playerData.url || '';
                let encrypt = Number(playerData.encrypt) || 0;
                if (encrypt === 2) url = base64Decode(url);
                if (encrypt === 1 || encrypt === 2) url = unescape(url);
                input = url || input;
            } catch (e) {}
        }
    `
};
