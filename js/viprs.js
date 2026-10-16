var rule = {
    title: 'viprs4.cc',
    host: 'https://viprs4.cc',
    searchUrl: '/s.html?name=**&page=fypage',
    searchable: 2,
    quickSearch: 0,
    filterable: 0,
    headers: {
        'User-Agent': 'MOBILE_UA'
    },
    timeout: 5000,
    play_parse: true,
    lazy: `js:
        let html = request(input);
        let match = html.match(/var player_aaaa\\s*=\\s*(\\{.*?\\})\\s*<\\/script>/s);
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
    `,
    搜索: '.group.relative.flex.flex-col.h-full;h3&&Text;img&&data-src;a&&href'
};
