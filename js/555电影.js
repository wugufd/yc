var rule = {
    title:'555电影',
    host:'https://wwqnp.wiki',
    // homeUrl:'/play/',
    //url:'/play/fyclass_fypage.html',
    searchUrl:'/vodsearch/**-------------.html',
    searchable: 0,
    quickSearch: 0,
    // class_parse:'.main:eq(1)&&li;a&&Text;a&&href;.*/(\\d+)_1.html',
    // class_parse:'.lei_class&&a;a&&Text;a&&href;.*/(\\d+)_1.html',
    class_name:'首页&Netflix&电影&连续剧&福利&动漫&综艺纪录',
    class_url:'1&2&3&4&5&6&7',
    headers:{
        'User-Agent':'MOBILE_UA'
    },
    timeout:5000,
    play_parse:true,
    lazy:'',
    limit:6,
    double:false,
    推荐:'*',
    一级:'js:var d=[];pdfh=jsp.pdfh;pdfa=jsp.pdfa;pd=jsp.pd;var html=request(input);let list=pdfa(html,".module-main&&a");
	list.forEach((it)=>{d.push({title:pdfh(it,".module-poster-item-title&&Text"),desc:"🎤"+pdfh(it,".module-item-douban&&Text")+"｜"+pdfh(it,".module-item-note&&Text"),
	pic_url:pd(it,"img&&src"),url:pd(it,"a&&href"),})});setResult(d);',
    二级:'*',
    //搜索:'.video_list&&li;a&&title;;.singer&&Text;a&&href;.t_03:eq(1)&&Text',
    搜索:'.module-main&&a;a&&title;;.module-items&&a;a&&href;.t_03:eq(1)&&Text'
}