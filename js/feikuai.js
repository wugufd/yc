var rule = {
    title: '飞快TV',
    host: 'https://feikuai.in',
    homeUrl: '/',
    searchUrl: '/vodsearch/**----------fypage---.html',
    searchable: 2,
    quickSearch: 0,
    filterable: 0,
    headers: {
        'User-Agent': 'MOBILE_UA',
        'Referer': 'https://feikuai.in/'
    },
    timeout: 30000,
    class_name: '',
    class_url: '',

    搜索: `js:
        let key = encodeURIComponent(KEY);
        let url = HOST + '/vodsearch/' + key + '----------' + MY_PAGE + '---.html';
        let html = request(url);
        let d = [];
        pdfa(html, '.module-card-item').forEach(it => {
            d.push({
                vod_name: pdfh(it, '.module-card-item-title strong&&Text'),
                vod_pic: pd(it, '.module-item-pic&&img&&data-original', HOST),
                vod_remarks: pdfh(it, '.module-item-note&&Text'),
                vod_id: pd(it, '.module-card-item-poster&&href', HOST)
            });
        });
        VODS = d;
    `,

    lazy: `js:
        let html = request(input);
        let url = '';

        let m = html.match(/var player_aaaa\\s*=\\s*(\\{.*?\\})\\s*<\\/script>/s);
        if (m) {
            try {
                let data = JSON.parse(m[1]);
                url = data.url || '';
                let enc = Number(data.encrypt) || 0;
                if (enc === 2) url = base64Decode(url);
                if (enc === 1 || enc === 2) url = unescape(url);
                if (url && url.indexOf('//') === 0) url = 'https:' + url;
            } catch (e) { url = ''; }
        }

        if (!url || !/\\.m3u8|\\.mp4/.test(url)) {
            let m2 = html.match(/id="fk-online-download-data">([\\s\\S]*?)<\\/script>/);
            if (m2) {
                try {
                    let j = JSON.parse(m2[1]);
                    let sid = null;
                    let sidMatch = html.match(/data-fk-sid="(\\d+)"/);
                    if (sidMatch) sid = Number(sidMatch[1]);
                    let src = (j.sources || []).find(s => s.sid === sid) || (j.sources || [])[0];
                    if (src && src.episodes && src.episodes.length) {
                        let nid = null;
                        let nidMatch = html.match(/data-fk-nid="(\\d+)"/);
                        if (nidMatch) nid = Number(nidMatch[1]);
                        let ep = src.episodes.find(e => e.nid === nid) || src.episodes[0];
                        if (ep && ep.url) url = ep.url;
                    }
                } catch (e) {}
            }
        }

        if (url) {
            input = { parse: 0, jx: 0, url: url };
        } else {
            input = { parse: 1, jx: 1, url: input };
        }
    `
};
