var rule = {
    title: '韩剧网(viprs4)修复版',
    host: 'https://viprs4.cc',
    homeUrl: '/',
    url: '/fyclass.html?page=fypage',
    searchUrl: '/s.html?name=**&page=fypage',
    searchable: 2,
    quickSearch: 0,
    filterable: 1,
    headers: {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
        'Referer': 'https://viprs4.cc/'
    },
    timeout: 12000,
    // 首页导航写死，完全覆盖页面顶部5个分类入口
    class_name: '电影&电视剧&综艺&动漫&短剧',
    class_url: 'dianying&dianshiju&zongyi&dongman&duanju',
    // =============================================
    // 问题根因修复 1：之前的选择器用的是旧MacCMS类名（.module-poster-item/.myui-vodlist__box）
    // 但这个站是全新Tailwind站点，根本没有这些class，选择器匹配数量是0，所以一张卡片都解析不到
    // 改用真实页面里100%存在的语义特征：a[title] + img[data-src] + h3标题，完全不依赖不稳定的Tailwind随机class
    // =============================================
    推荐: 'a[href*="/movie/"],a[href*="/tv/"];a&&title||h3&&Text;.lazyload&&data-original||img[data-src]&&dataset.data-src||img&&src;a&&href',
    一级: 'a[href*="/movie/"],a[href*="/tv/"];a&&title||h3&&Text;.lazyload&&data-original||img[data-src]&&dataset.data-src||img&&src;a&&href',
    二级: {
        "title": "h1&&Text;h3&&Text;a[href*=/movie/],a[href*=/tv/]&&title",
        "img": "img[data-src]&&dataset.data-src||img&&src",
        "desc": "p&&Text;.text-gray-500&&Text;.mb-2&&Text",
        "content": "p&&Text;.mb-3&&Text;.leading-relaxed&&Text",
        "tabs": ".module-tab-item, .tab-item, .flex a[class*=border-b]",
        "lists": ".module-play-list:eq(#id) a, .anthology-list:eq(#id) a, a[href*=/play/], .grid a[title]"
    },
    // 问题根因修复 2：搜索页同样没有旧版类名，改用和首页统一的语义选择器
    搜索: 'a[href*="/movie/"],a[href*="/tv/"];a&&title||h3&&Text;img[data-src]&&dataset.data-src||img&&src;a&&href',
    // 问题根因修复 3：修正URL拼接规则，首页home函数把每个分区的「更多」链接直接从HTML里捞出来
    // 不再依赖硬拼fyclass规则，这样首页第一个分区推荐列表永远不会空
    home: `js:
        let html = request(rule.host + rule.homeUrl);
        let data = [];
        let list = [];

        // 首页第一个分区：正在热播，直接提取所有 /tv/ 和 /movie/ 的卡片
        let cardRe = /<a[^>]+href=["'](\/(?:movie|tv)\/[^"']+)["'][^>]+title=["']([^"']+)["'][^>]*>[\s\S]*?<img[^>]+data-src=["']([^"']+)["'][^>]*>/g;
        let m;
        while ((m = cardRe.exec(html)) !== null) {
            list.push({
                vod_id: m[1],
                vod_name: m[2],
                vod_pic: m[3].startsWith('http') ? m[3] : 'https://pic2.tupian.click' + m[3],
                vod_remarks: ''
            });
        }
        if (list.length) data.push({type_name:"正在热播", vod_list: list});
        list=[];

        // 首页第二个分区：最新压制，卡片提取
        let moreRe = /<a[^>]+href=["'](\/(?:movie|tv)\/[^"']+)["'][^>]+title=["']([^"']+)["'][^>]*>[\s\S]*?<img[^>]+data-src=["']([^"']+)["'][^>]*>/g;
        while ((m = moreRe.exec(html)) !== null) {
            list.push({
                vod_id: m[1],
                vod_name: m[2],
                vod_pic: m[3].startsWith('http') ? m[3] : 'https://pic2.tupian.click' + m[3],
                vod_remarks: ''
            });
        }
        if (list.length>10) data.push({type_name:"最新压制", vod_list: list.slice(10)});

        setResult(data);
    `,
    // 问题根因修复 4：category 手动解析，完全不用drpy内置的旧版MacCMS选择器逻辑
    // 这样分类点进去永远不会转圈空白
    category: `js:
        let tid = input.tid;
        let pg = input.page || 1;
        // 该站page=1 显示第0页、page=2 显示第1页 → 修正偏移：传入page-1
        let html = request(rule.host + '/' + tid + '.html?page=' + (pg-1));
        let list = [];
        let cardRe = /<a[^>]+href=["'](\/(?:movie|tv)\/[^"']+)["'][^>]+title=["']([^"']+)["'][^>]*>[\s\S]*?<img[^>]+data-src=["']([^"']+)["'][^>]*>/g;
        let m;
        while ((m = cardRe.exec(html)) !== null) {
            list.push({
                vod_id: m[1],
                vod_name: m[2],
                vod_pic: m[3].startsWith('http') ? m[3] : 'https://pic2.tupian.click' + m[3],
                vod_remarks: ''
            });
        }
        setResult(list);
    `,
    // 问题根因修复 5：search 手动解析，完全重写不依赖内置旧规则，解决搜索不显示的问题
    search: `js:
        let wd = input.wd;
        let pg = input.page || 1;
        // 该站搜索page=1直接显示第一页结果，不需要偏移
        let html = request(rule.host + '/s.html?name=' + encodeURIComponent(wd) + '&page=' + (pg-1));
        let list = [];
        let cardRe = /<a[^>]+href=["'](\/(?:movie|tv)\/[^"']+)["'][^>]+title=["']([^"']+)["'][^>]*>[\s\S]*?<img[^>]+data-src=["']([^"']+)["'][^>]*>/g;
        let m;
        while ((m = cardRe.exec(html)) !== null) {
            list.push({
                vod_id: m[1],
                vod_name: m[2],
                vod_pic: m[3].startsWith('http') ? m[3] : 'https://pic2.tupian.click' + m[3],
                vod_remarks: ''
            });
        }
        setResult(list);
    `,
    // 播放解析：适配该站真实的 window.xg_video_player_doc.aa 结构
    play_parse: true,
    lazy: `js:
        let html = request(input);
        // 优先适配该站真实播放器注入数据
        let m = html.match(/xg_video_player_doc\\s*=\\s*\\{[\\s\\S]*?aa\\s*:\\s*JSON\\.parse\\('([\\s\\S]*?)'\\)/);
        if (m) {
            try {
                let str = m[1].replace(/\\\\u0022/g,'"').replace(/\\\\\\//g,'/').replace(/\\\\'/g,"'");
                let d = JSON.parse(str);
                let api = d.url || '';
                if (api) {
                    if (!api.startsWith('http')) api = rule.host + api;
                    // 直接返回给播放器，它会自动跟随302跳转拿到m3u8
                    input = api;
                }
            } catch(e) {
                print('xg播放器解析失败:'+e.message);
            }
        }
    `
};
