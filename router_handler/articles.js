// 导入数据库
const db = require('../db/index')

// 获取新闻推荐列表
exports.getArticles = (req, res) => {
    const sql = 'select * from articles where channel_id=? and user_id=0 and status=1'
    db.query(sql, req.query.channel_id, (err, result) => {
        if (err) return res.cc('获取新闻列表失败')
        if (result.length > 0) {
            let results = result.map(item => {
                item.cover = {
                    type: item.type,
                    images: item.images ? item.images.split('&') : []
                }
                return item
            })
            res.send({
                status: 0,
                message: '获取新闻列表成功',
                data: {
                    pre_timestamp: result[0].pre_timestamp,
                    results: results
                }
            })
        } else {
            res.send({
                status: 0,
                message: '获取新闻列表成功',
                data: '无数据'
            })
        }
    })
}

//获取模糊搜索列表
exports.suggestions = (req, res) => {
    const sql = 'select title from articles where title like ?'
    let item = "%" + req.query.q + "%"
    db.query(sql, item, (err, result) => {
        if (err) return res.cc('获取搜索建议失败' + err.message)
        let results = result.map(item => {
            return item.title
        })
        results = Array.from(new Set(results))
        res.send({
            status: 200,
            message: '获取搜索建议成功',
            data: {
                options: results
            }
        })
    })
}

//获取搜索结果
exports.search = (req, res) => {
    const sql = 'select title,art_id from articles where title like ? and status=1'
    let item = "%" + req.query.q + "%"
    db.query(sql, item, (err, result) => {
        if (err) return res.cc('获取搜索结果失败' + err.message)
        let results = result.map(item => {
            return item
        })

        //数组去重
        function unlink(arr) {
            for (var i = 0; i < arr.length; i++) {
                for (var j = i + 1; j < arr.length; j++) {
                    if (arr[i].art_id == arr[j].art_id) {
                        arr.splice(j, 1);
                        j--;
                    }
                }
            }
            return arr
        }
        results = unlink(result)
        console.log(req.query.page);
        if (req.query.page == 1) {
            res.send({
                status: 200,
                message: '获取搜索结果成功',
                data: {
                    page: 1,
                    per_page: 20,
                    results: results
                }
            })
        } else {
            res.send({
                status: 200,
                message: '获取搜索结果成功',
                data: {
                    page: 1,
                    per_page: 20,
                    results: []
                }
            })
        }
    })
}