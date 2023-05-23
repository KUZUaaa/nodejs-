// 导入数据库
const { json } = require('express');
const db = require('../db/index')

//导入时间依赖
const sd = require('silly-datetime');

//评论
exports.addComments = (req, res) => {
    const time = sd.format(new Date(), 'YYYY-MM-DD HH:mm');
    const sqlUser = 'select * from ev_users where id=?'
    const sql = 'insert into comments set ?'
    const sqlCom_id = 'select com_id from comments where com_id = (select max(com_id) from comments)'
    db.query(sqlUser, req.user.id, (err, result0) => {
        if (err) return res.cc('获取用户信息失败')
        db.query(sql, {
            aut_id: req.user.id,
            aut_name: result0[0].name,
            aut_photo: result0[0].photo,
            like_count: 0,
            reply_count: 0,
            pubdate: time,
            content: req.body.content,
            target: req.body.target,
            art_id: req.body.art_id ? req.body.art_id : 0
        }, (err, result1) => {
            if (err) return res.cc('发表评论失败' + err.message)
            db.query(sqlCom_id, (err, results2) => {
                if (err) return res.cc('获取评论id失败' + err.message)
                    //更新评论数据
                const sqlUpdate = 'update comments set reply_count=? where com_id=?'
                const sqlCount = 'select * from comments where target=?'
                db.query(sqlCount, req.body.target, (err, result3) => {
                    if (err) return res.cc('获取所有回复数据失败')
                    db.query(sqlUpdate, [result3.length, req.body.target], (err, result4) => {
                        if (err) return res.cc('更新数据失败')
                        db.query(sqlCount, req.body.art_id, (err, result4) => {
                            if (err) return res.cc('获取文章评论数据失败')
                            const sqlArtCommCount = 'update articles set comm_count=? where art_id=?'
                            db.query(sqlArtCommCount, [result4.length, req.body.target], (err, result5) => {
                                res.send({
                                    message: '评论成功',
                                    data: {
                                        com_id: results2[0].com_id,
                                        target: req.body.target,
                                        art_id: req.body.art_id ? req.body.art_id : 0
                                    }
                                })
                            })

                        })

                    })
                })


            })
        })
    })

}

//获取评论
exports.getComments = (req, res) => {
    const sqlArt = 'select * from comments where art_id=? and    target=?'
    const sqlCom = 'select * from comments where target=? '
    if (req.query.type == 'a') {
        //获取对文章的评论
        db.query(sqlArt, [req.query.source, req.query.source], (err, result) => {
            if (err) return res.cc('获取文章评论失败' + err.message)
            if (req.query.offset == 0) {
                return res.send({
                    message: '获取评论成功',
                    data: {
                        total_count: result.length,
                        end_id: 0,
                        last_id: 0,
                        results: []
                    }
                })
            }
            const sqlLike = 'select * from comment_like where user_id=? and com_id=?'
            db.query(sqlLike, [req.user.id, req.query.source], (err, result2) => {
                if (err) return res.cc('获取用户点赞详情失败')
                if (result2.length > 0) result.is_liking = true
                else result.is_liking = false
                res.send({
                    message: '获取评论成功',
                    data: {
                        total_count: result.length,
                        end_id: 0,
                        last_id: 0,
                        results: result
                    }
                })
            })

        })
    } else if (req.query.type == 'c') {
        //获取对评论的评论
        db.query(sqlCom, [req.query.source], (err, result) => {
            if (err) return res.cc('获取评论的评论失败')
            if (req.query.offset == 0) {
                return res.send({
                    message: '获取评论成功',
                    data: {
                        total_count: result.length,
                        end_id: 0,
                        last_id: 0,
                        results: []
                    }
                })
            }
            const sqlLike = 'select * from comment_like where user_id=? and com_id=?'
            db.query(sqlLike, [req.user.id, req.query.source], (err, result2) => {
                if (err) return res.cc('获取用户点赞详情失败')
                if (result2.length > 0) result.is_liking = true
                else result.is_liking = false
                res.send({
                    message: '获取评论成功',
                    data: {
                        total_count: result.length,
                        end_id: 0,
                        last_id: 0,
                        results: result
                    }
                })
            })

        })
    }

}

//点赞评论
exports.likeComments = (req, res) => {
    const sql = 'insert into comment_like set ?'
    const sqlCount = 'select * from comment_like where com_id=?'
    const sqlUpdate = 'update comments set like_count=? where com_id=?'
    db.query(sql, { user_id: req.user.id, com_id: req.body.target }, (err, result) => {
        if (err) return res.cc('点赞失败' + err.message)
        db.query(sqlCount, req.body.target, (err, result1) => {
            if (err) return res.cc('获取点赞总失败')
            db.query(sqlUpdate, [result1.length, req.body.target], (err, result2) => {
                res.send({
                    message: '点赞成功',
                    data: {
                        target: req.body.target
                    }
                })
            })
        })

    })
}

//取消点赞评论
exports.UnlikeComments = (req, res) => {
    const sqlCount = 'select * from comment_like where com_id=?'
    const sqlUpdate = 'update comments set like_count=? where com_id=?'
    const sql = 'delete from comment_like where user_id=? and com_id=?'
    db.query(sql, [req.user.id, req.params.target], (err, result) => {
        if (err) return res.cc('取消点赞失败' + err.message)
        db.query(sqlCount, req.body.target, (err, result1) => {
            if (err) return res.cc('获取点赞总失败')
            db.query(sqlUpdate, [result1.length, req.body.target], (err, result2) => {
                res.send({
                    message: '取消点赞成功',
                    data: {
                        target: req.params.target
                    }
                })
            })
        })

    })
}