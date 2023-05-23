// 导入数据库
const db = require('../db/index')

// 获取文章内容详情
exports.getArticlesContent = (req, res) => {
    const sqlContentUnLogin = 'select * from articles where art_id=? and user_id=?'
    const sqlContent = 'select * from articles where art_id=? and user_id=?'
    const sqlInsert = 'insert into articles set ?'
    const sqlFollowed = 'select * from user_followed where id=? and aut_id=?'
    db.query(sqlContent, [req.params.article_id, req.user.id], (err, result) => {
        if (err) return res.cc('获取新闻内容失败，请联系管理员处理!')
        if (result.length > 0) {
            //用户有浏览过
            res.send({
                status: 200,
                message: '获取新闻内容成功',
                data: result[0]
            })
        } else {
            //用户未浏览
            db.query(sqlContentUnLogin, [req.params.article_id, 0], (err, result) => {
                if (err) return res.cc('获取新闻内容失败，请联系管理员处理!')
                let insertContent = result[0]
                db.query(sqlFollowed, [req.user.id, insertContent.aut_id], (err, result2) => {
                    if (err) return res.cc('获取关注详情失败，请联系管理员处理!')
                    if (result2.length > 0) {
                        //用户有关注
                        insertContent.is_followed = true
                    } else {
                        //用户未关注
                        insertContent.is_followed = false
                    }
                    insertContent.user_id = req.user.id
                    insertContent.attitude = -1
                    insertContent.is_collected = false
                    db.query(sqlInsert, insertContent, (err, result3) => {
                        if (err) return res.cc('用户首次查看详情失败，请联系管理员处理!' + err)
                        res.send({
                            status: 200,
                            message: '获取新闻内容成功',
                            data: insertContent
                        })
                    })
                })


            })
        }
    })
}

// 文章审核通过
exports.auditPassArticles = (req, res) => {
    const sql = 'update articles set status=1 where art_id=?'
    db.query(sql, req.params.article_id, (err, result) => {
        if (err) return res.cc('审核通过失败')
        res.send({
            status: 200,
            message: '审核成功',
        })
    })
}

// 文章审核通过
exports.auditRefuseArticles = (req, res) => {
    const sql = 'update articles set status=-1 where art_id=?'
    db.query(sql, req.params.article_id, (err, result) => {
        if (err) return res.cc('审核未通过失败')
        res.send({
            status: 200,
            message: '审核成功',
        })
    })
}

//收藏文章
exports.collections = (req, res) => {
    const sql = 'update articles set is_collected=? where art_id=? and user_id=?'
    db.query(sql, [true, req.body.target, req.user.id], (err, result) => {
        if (err) return res.cc('收藏文章失败')
        res.send({
            status: 200,
            message: '收藏文章成功',
            data: { target: req.body.target }
        })
    })
}

//取消收藏文章
exports.UnCollections = (req, res) => {
    const sql = 'update articles set is_collected=? where art_id=? and user_id=?'
    db.query(sql, [false, req.params.target, req.user.id], (err, result) => {
        if (err) return res.cc('取消收藏文章失败')
        res.send({
            status: 200,
            message: '取消收藏文章成功',
            data: { target: req.params.target }
        })
    })
}

//点赞文章
exports.likeing = (req, res) => {
    const sql = 'update articles set attitude=? where art_id=? and user_id=?'
    db.query(sql, [1, req.body.target, req.user.id], (err, result) => {
        if (err) return res.cc('点赞失败')
        res.send({
            status: 200,
            message: '点赞成功',
            data: { target: req.body.target }
        })
    })
}

//取消点赞文章
exports.UnLikeing = (req, res) => {
    const sql = 'update articles set attitude=? where art_id=? and user_id=?'
    db.query(sql, [-1, req.params.target, req.user.id], (err, result) => {
        if (err) return res.cc('取消点赞失败')
        res.send({
            status: 200,
            message: '取消点赞成功',
            data: { target: req.params.target }
        })
    })
}