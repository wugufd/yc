var rule = {
    title:'飞快TV1',
    host:'https://feikuai.in',
    homeUrl:'/',
    url:'/vodshow/fyclass--------fypage---.html',
    searchUrl:'/vodsearch/-------------fypage---.html?wd=**',
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
        let html = request(input);
        let aaaa = html.match(/var player_aaaa=({[\s\S]*?})<\/script>/);
        if(aaaa){
            let play = JSON.parse(aaaa[1]);
            let url = play.url;
            if(play.encrypt==2){
                url = unescape(atob(url));
            }
            input = {
                jx:0,
                url:url,
                parse:0
            };
        }
    }),
    limit:6,
    推荐:$js.toString(()=>{
        d = [];
        let items = pdfa.querySelectorAll('.module-poster-item.module-item');
        items.forEach(it=>{
            let img = it.querySelector('.module-item-pic img');
            let pic = img && (img.getAttribute('data-original') || img.getAttribute('data-remote') || img.getAttribute('data-real-src') || img.src);
            d.push({
                title:it.title,
                url:it.getAttribute('href'),
                pic:pic,
                desc:it.querySelector('.module-item-note') && it.querySelector('.module-item-note').innerText
            });
        });
    }),
    一级:$js.toString(()=>{
        d = [];
        let items = pdfa.querySelectorAll('.module-poster-item.module-item');
        items.forEach(it=>{
            let img = it.querySelector('.module-item-pic img');
            let pic = img && (img.getAttribute('data-original') || img.getAttribute('data-remote') || img.getAttribute('data-real-src') || img.src);
            let note = it.querySelector('.module-item-note');
            let douban = it.querySelector('.module-item-douban');
            let remark = '';
            if(note) remark = note.innerText;
            if(douban) remark = remark + ' ' + douban.innerText;
            d.push({
                title:it.getAttribute('title'),
                url:it.getAttribute('href'),
                pic:pic,
                desc:remark.trim()
            });
        });
    }),
    二级:{
        title:'.module-info-heading h1&&Text;h1&&Text',
        img:'.module-info-poster img&&data-original;.module-info-poster img&&data-remote;.module-info-poster img&&src',
        desc:'.module-info-item:eq(-1)&&Text;.module-info-content&&Text',
        content:'.module-info-introduction&&Text;.module-info-content&&Text',
        tabs:'.module-tab-item.tab-item',
        lists:'.module-play-list:eq(#id) a',
        tab_text:'body&&Text',
        list_text:'body&&Text',
        list_url:'a&&href'
    },
    搜索:$js.toString(()=>{
        d = [];
        let items = pdfa.querySelectorAll('.module-card-item.module-item');
        if(items.length==0) items = pdfa.querySelectorAll('.module-card-item');
        items.forEach(it=>{
            let a = it.querySelector('a.module-card-item-poster');
            if(!a) a = it.querySelector('a[href*="/voddetail/"]');
            if(!a) return;
            let img = it.querySelector('.module-item-pic img');
            let pic = img && (img.getAttribute('data-original') || img.getAttribute('data-remote') || img.getAttribute('data-real-src') || img.src);
            let titleA = it.querySelector('.module-card-item-info strong a') || it.querySelector('.module-card-item-title strong') || it.querySelector('strong');
            let title = titleA ? titleA.innerText.trim() : (a.getAttribute('title')||'');
            let note = it.querySelector('.module-item-note');
            let typeTag = it.querySelector('.module-card-item-class');
            let desc = '';
            if(typeTag) desc = typeTag.innerText;
            if(note) desc = desc + ' ' + note.innerText;
            d.push({
                title:title,
                url:a.getAttribute('href'),
                pic:pic,
                desc:desc.trim()
            });
        });
    })
}
