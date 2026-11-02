// 豆瓣热播 TVBox drpy2 规则
// 适配接口：豆瓣移动端公开热播接口，无需apikey
// 支持分类：热门电影、新片上映、热门剧集、热门综艺、动漫热播
var rule = {
    title: '豆瓣热播',
    host: 'https://m.douban.com',
    headers: {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
        'Referer': 'https://movie.douban.com/'
    },
    // 分类配置：tid对应接口路径后缀，电影/movie、剧集/tv、综艺/tv?tag=综艺、动漫/tv?tag=动漫
    class_name: '热门电影&新片上映&热门剧集&热门综艺&动漫热播',
    class_url: 'movie&movie_new&tv&tv_variety&tv_cartoon',
    homeUrl: '/rexxar/api/v2/subject/recent_hot/movie?start=0&limit=20',
    url: '/rexxar/api/v2/subject/recent_hot/fyclass?start=fypage&limit=20',
    searchUrl: '/rexxar/api/v2/search?type=movie&q=**&start=fypage&limit=20',
    detailUrl: '/rexxar/api/v2/movie/subject/fyid',
    // 一级解析：列表数据
    list_parse: function (html, obj) {
        let data = JSON.parse(html);
        let items = data.items || data.subjects || [];
        let list = [];
        items.forEach(it => {
            list.push({
                vod_id: it.id,
                vod_name: it.title,
                vod_pic: it.cover_url || it.pic || (it.images && it.images.large),
                vod_remarks: it.rating ? '豆瓣 ' + (it.rating.value || it.rating.average) : it.card_subtitle || ''
            })
        });
        return {
            list: list,
            pagecount: data.total ? Math.ceil(data.total / 20) : (list.length >= 20 ? obj.page + 1 : obj.page)
        };
    },
    // 分类url替换逻辑
    class_parse: function (url, obj) {
        if (obj.tid === 'movie') {
            return url.replace('fyclass', 'movie');
        } else if (obj.tid === 'movie_new') {
            return url.replace('fyclass', 'movie_coming');
        } else if (obj.tid === 'tv') {
            return url.replace('fyclass', 'tv');
        } else if (obj.tid === 'tv_variety') {
            return '/rexxar/api/v2/tv/recent_hot?start=fypage&limit=20&tag=综艺';
        } else if (obj.tid === 'tv_cartoon') {
            return '/rexxar/api/v2/tv/recent_hot?start=fypage&limit=20&tag=动漫';
        }
        return url.replace('fyclass', obj.tid);
    },
    // 详情页解析
    detail_parse: function (html) {
        let data = JSON.parse(html);
        let directors = data.directors ? data.directors.map(d => d.name).join(' / ') : '';
        let actors = data.actors ? data.actors.map(a => a.name).join(' / ') : (data.casts ? data.casts.map(c => c.name).join(' / ') : '');
        let genres = data.genres ? data.genres.join(' / ') : '';
        let year = data.year || (data.pubdate && data.pubdate[0] ? data.pubdate[0].split('-')[0] : '');
        let rating = data.rating ? (data.rating.value || data.rating.average) : '暂无评分';
        let desc = data.intro || data.summary || '';
        return {
            vod_id: data.id,
            vod_name: data.title,
            vod_pic: data.cover_url || (data.images && data.images.large),
            vod_year: year,
            vod_director: directors,
            vod_actor: actors,
            vod_type: genres,
            vod_remarks: '豆瓣评分 ' + rating,
            vod_content: desc,
            // 豆瓣仅做推荐，播放线路跳转到你其他影视源搜索（TVBox会自动联动其他站搜索）
            vod_play_from: '豆瓣推荐',
            vod_play_url: '搜索播放$' + data.title
        };
    },
    // 搜索解析复用列表逻辑
    search_parse: function (html, obj) {
        return this.list_parse(html, obj);
    }
};
// TVBox 规则导出固定写法
JSON.stringify(rule);
