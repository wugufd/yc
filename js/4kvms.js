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
    lazy: `js:
        input = { parse: 1, url: input, jx: 0 };
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
