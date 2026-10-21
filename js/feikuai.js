var rule = {
    title:'飞快TV',
    host:'https://feikuai.in',
    homeUrl:'/',
    url:'/vodshow/fyclass--------fypage---.html',
    searchUrl:'/vodsearch/**----------fypage---.html',
    searchable:2,
    quickSearch:0,
    filterable:0,
    headers:{
        'User-Agent':'MOBILE_UA',
        'Referer':'https://feikuai.in/'
    },
    timeout:5000,
    class_name:'电影&剧集&综艺&动漫',
    class_url:'1&2&3&4',
    play_parse:true,
    lazy:$js.toString(()=>{
        input = {parse:0, url: input, jx: 0};
        let html = request(input.url);
        let aaaa = html.match(/var\s+player_aaaa\s*=\s*(\{[\s\S]*?\})[\s;]/);
        if (aaaa) {
            try {
                let play = JSON.parse(aaaa[1]);
                let url = play.url || '';
                if (play.encrypt == 2 && url) {
                    try { url = unescape(atob(url)); } catch (e) {}
                }
                if (url) {
                    input.url = url;
                }
            } catch (e) {}
        }
    }),
    limit:40,
    推荐:$js.toString(()=>{
        d = [];
        let items = pdfa.querySelectorAll('.module-poster-item.module-item');
        if (items.length == 0) {
            items = pdfa.querySelectorAll('a[href*="/voddetail/"]');
        }
        items.forEach(it => {
            let link = it.tagName == 'A' ? it : (it.querySelector('a[href*="/voddetail/"]') || it.querySelector('a'));
            if (!link) return;
            let href = link.getAttribute('href') || (it.getAttribute && it.getAttribute('href'));
            if (!href || href.indexOf('/voddetail/') < 0) return;
            let img = it.querySelector('.module-item-pic img') || it.querySelector('img');
            let pic = '';
            if (img) {
                pic = img.getAttribute('data-original') || img.getAttribute('data-remote') || img.getAttribute('data-real-src') || img.src || '';
            }
            let titleEl = it.querySelector('.module-poster-item-title') || it.querySelector('img');
            let title = (link.getAttribute('title') || (titleEl && (titleEl.getAttribute('alt') || titleEl.innerText)) || '').trim();
            if (!title) title = it.getAttribute('title') || '';
            let note = it.querySelector('.module-item-note');
            let douban = it.querySelector('.module-item-douban, .module-item-imdb');
            let remark = '';
            if (note) remark = note.innerText.trim();
            if (douban) remark = (remark + ' ' + douban.innerText.trim()).trim();
            d.push({
                title: title,
                url: href,
                pic: pic,
                desc: remark
            });
        });
    }),
    一级:$js.toString(()=>{
        d = [];
        let items = pdfa.querySelectorAll('a.module-poster-item.module-item');
        if (items.length == 0) items = pdfa.querySelectorAll('.module-poster-item');
        items.forEach(it => {
            let img = it.querySelector('.module-item-pic img');
            let pic = '';
            if (img) {
                pic = img.getAttribute('data-original') || img.getAttribute('data-remote') || img.getAttribute('data-real-src') || img.src || '';
            }
            let note = it.querySelector('.module-item-note');
            let douban = it.querySelector('.module-item-douban, .module-item-imdb');
            let remark = '';
            if (note) remark = note.innerText.trim();
            if (douban) remark = (remark + ' ' + douban.innerText.trim()).trim();
            let titleEl = it.querySelector('.module-poster-item-title') || img;
            let title = (it.getAttribute('title') || (titleEl && titleEl.innerText) || (img && img.alt) || '').trim();
            d.push({
                title: title,
                url: it.getAttribute('href'),
                pic: pic,
                desc: remark
            });
        });
        let nextEl = pdfa.querySelector('.page-item-next, .page-link:contains("下一页"), a:contains("下一页")');
    }),
    二级:$js.toString(()=>{
        V = pdfa.querySelector('.module-info-heading h1') && pdfa.querySelector('.module-info-heading h1').innerText.trim() || '';
        let coverImg = pdfa.querySelector('.module-info-poster .module-item-pic img') || pdfa.querySelector('.module-info-main .module-item-pic img') || pdfa.querySelector('.module-item-pic img');
        let pic = '';
        if (coverImg) {
            pic = coverImg.getAttribute('data-original') || coverImg.getAttribute('data-remote') || coverImg.src || '';
        }
        let infoItems = pdfa.querySelectorAll('.module-info-item');
        let director = '', actor = '', desc = '', content = '';
        let year='', area='', state='';
        for (let i = 0; i < infoItems.length; i++) {
            let txt = infoItems[i].innerText.trim();
            if (txt.indexOf('导演') >= 0) {
                director = txt.replace(/导演[：:]\s*/, '').trim();
            } else if (txt.indexOf('主演') >= 0) {
                actor = txt.replace(/主演[：:]\s*/, '').trim();
            } else if (txt.indexOf('更新') >= 0) {
                // update info
            } else if (txt.indexOf('状态') >= 0) {
                state = txt.replace(/状态[：:]\s*/, '').trim();
            } else if (txt.indexOf('评分') >= 0) {
                desc = txt.replace(/评分[：:]\s*/, '').trim();
            } else if (i == 0 || (txt.length > 30 && txt.indexOf('：') < 0)) {
                content = txt.trim();
            }
        }
        let tagLinks = pdfa.querySelectorAll('.module-info-tag-link a, .module-info-tag a');
        tagLinks.forEach(a => {
            let t = a.innerText.trim();
            if (/^20\d{2}$|^19\d{2}$/.test(t)) year = t;
            else if (t.length <= 4 && !/[,\/]/.test(t)) area = area ? area + ' ' + t : t;
        });
        let blk = pdfa.querySelector('.module-info-intro-content, .vod_content, .module-info-content blockquote, .content');
        if (blk) {
            let bt = blk.innerText.trim();
            if (bt.length > content.length) content = bt;
        }
        if (state) desc = (desc + ' ' + state).trim();
        let tabs = [];
        let tabEls = pdfa.querySelectorAll('#y-playList .module-tab-item.tab-item');
        if (tabEls.length == 0) tabEls = pdfa.querySelectorAll('.module-tab-item.tab-item');
        let lists = [];
        let listEls = pdfa.querySelectorAll('.module-play-list');
        for (let i = 0; i < tabEls.length; i++) {
            let t = tabEls[i];
            let name = t.querySelector('span');
            let tabName = name ? name.innerText.trim() : t.innerText.trim().replace(/\d+$/, '').trim();
            tabs.push(tabName);
            let eps = [];
            let listBox = listEls[i];
            if (listBox) {
                let aEls = listBox.querySelectorAll('a.module-play-list-link');
                aEls.forEach(a => {
                    let epName = a.querySelector('span');
                    let n = epName ? epName.innerText.trim() : a.innerText.trim();
                    eps.push(n + '$' + a.getAttribute('href'));
                });
            }
            lists.push(eps.join('#'));
        }
        TABS = tabs;
        LISTS = lists;
    }),
    搜索:$js.toString(()=>{
        d = [];
        let items = pdfa.querySelectorAll('.module-card-item.module-item');
        if (items.length == 0) items = pdfa.querySelectorAll('.module-search-item');
        items.forEach(it => {
            let a = it.querySelector('a.module-card-item-poster') || it.querySelector('a[href*="/voddetail/"]');
            if (!a) return;
            let href = a.getAttribute('href');
            if (!href) return;
            let img = it.querySelector('.module-item-pic img') || a.querySelector('img');
            let pic = '';
            if (img) {
                pic = img.getAttribute('data-original') || img.getAttribute('data-remote') || img.getAttribute('data-real-src') || img.src || '';
            }
            let titleEl = it.querySelector('.module-card-item-title strong') || it.querySelector('.module-card-item-title a') || it.querySelector('strong');
            let title = titleEl ? titleEl.innerText.trim() : '';
            if (!title) title = (a.getAttribute('title') || (img && img.alt) || '').trim();
            let note = it.querySelector('.module-item-note');
            let typeTag = it.querySelector('.module-card-item-class');
            let info = '';
            if (typeTag) info += typeTag.innerText.trim();
            if (note) info = (info + ' ' + note.innerText.trim()).trim();
            let infoItems = it.querySelectorAll('.module-info-item-content');
            if (infoItems.length > 0) {
                let t = infoItems[0].innerText.trim();
                if (t) info = (info + ' ' + t).trim();
            }
            d.push({
                title: title,
                url: href,
                pic: pic,
                desc: info
            });
        });
    })
}
