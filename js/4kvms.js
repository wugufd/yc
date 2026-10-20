var rule = {
    title: '4k影视',
    host: 'https://www.4kvms.org',
    homeUrl: '/',
    url: '/fyclass',
    searchUrl: '/search?q=**',
    searchable: 2,
    quickSearch: 0,
    filterable: 0,
    headers: {
        'User-Agent': 'MOBILE_UA'
    },
    timeout: 5000,
    class_parse: '.hidden.lg\\:flex.items-center.space-x-2 a:gt(0):lt(4);a&&Text;a&&href;/(\\w+)',
    play_parse: true,
    // 下面是修改后的 lazy 部分，尝试直接请求接口绕过 Wasm
    lazy: `js:
        let html = request(input);
        
        // 1. 提取 p (data-v-id) 和 v (vodid短码)
        let pMatch = html.match(/data-v-id="(\\d+)"/);
        let p = pMatch ? pMatch[1] : '';
        
        let vMatch = html.match(/var vodid = '([a-zA-Z0-9]+)'/);
        let v = vMatch ? vMatch[1] : '';
        if(!v) {
            vMatch = input.match(/\\/play\\/([a-zA-Z0-9]+)/);
            v = vMatch ? vMatch[1] : '';
        }
        
        // 2. 伪造签名 s 和时间戳 t
        let s = '00000000000000000000000000000000';
        let t = Date.now();
        
        if(p && v) {
            // 3. 拼接接口，不传 k 参数
            let api = 'https://www.4kvms.org/video/play?p=' + p + '&v=' + v + '&q=1080&s=' + s + '&t=' + t;
            
            // 4. 带上 Referer 请求接口
            let res = request(api, {headers: {'Referer': input}});
            try {
                let json = JSON.parse(res);
                if(json.code === 200 && json.data && json.data.quality_urls && json.data.quality_urls.length > 0) {
                    // 成功拿到 m3u8
                    input = json.data.quality_urls[0].url;
                } else {
                    // 如果接口报错，打印出来方便排错
                    log('接口返回失败: ' + res);
                    input = { parse: 1, url: input, jx: 0 };
                }
            } catch(e) {
                log('JSON解析失败: ' + res);
                input = { parse: 1, url: input, jx: 0 };
            }
        } else {
            // 如果没抓到 p 或 v，退回嗅探
            input = { parse: 1, url: input, jx: 0 };
        }
    `,
    推荐: '.movie-card;h3&&Text;img&&data-src;.absolute.bottom-0&&Text;a&&href',
    一级: '.movie-card;h3&&Text;img&&data-src;.absolute.bottom-0&&Text;a&&href',
    二级: {
        "title": "h1&&Text;.flex.items-center.gap-3.mb-3.text-sm span:eq(1)&&Text",
        "img": ".movie-poster img&&src",
        "desc": ".grid.grid-cols-3.gap-2.text-xs .col-span-2&&Text",
        "content": ".bg-dark-800.rounded-lg.p-3 p&&Text",
        "tabs": ".flex.items-center.justify-between.mb-3 h2&&Text",
        "lists": ".grid.grid-cols-6.gap-2 a"
    },
    搜索: '.group.relative;h3&&Text;img&&data-src;.absolute.top-2.left-2&&Text;a&&href'
};
