// 导入数据库
const { ok } = require('assert')
const db = require('../db/index')

//导入文件读写模块
const fs = require('fs')
const { log } = require('console')

// 获取用户基本信息 
exports.getuser = (req, res) => {
    //文章数量
    const sqlArt = 'select * from articles where aut_id=? and user_id=?'
        //关注数量
    const sqlFollowed = 'select aut_id from user_followed where id=?'
        //粉丝数量
    const sqlFans = 'select id from user_followed where aut_id=?'
        //被赞数量
    const sqlLikings = 'select aut_id from articles where aut_id=? and attitude=1'
        //获取用户信息
    const sql = 'select id,name,photo,is_media,intro,art_count,follow_count,fans_count,like_count,is_admin from ev_users where id=?'
        //修改用户信息
    const sqlUpdate = 'update ev_users set ? where id=?'
    let artCount = 0
    let followedCount = 0
    let fansCount = 0
    let likingsCount = 0
    db.query(sqlArt, [req.user.id, 0], (err, result0) => {
            if (err) return res.cc(获取用户文章数量失败)
            artCount = result0.length
            db.query(sqlFollowed, req.user.id, (err, result1) => {
                if (err) return res.cc(获取用户关注数量失败)
                followedCount = result1.length
                db.query(sqlFans, req.user.id, (err, result2) => {
                    if (err) return res.cc(获取用户粉丝数量失败)
                    fansCount = result2.length
                    db.query(sqlLikings, req.user.id, (err, result3) => {
                        if (err) return res.cc(获取用户点赞数量失败)
                        likingsCount = result3.length
                        db.query(sqlUpdate, [{ art_count: artCount, follow_count: followedCount, fans_count: fansCount, like_count: likingsCount }, req.user.id], (err, result4) => {
                            if (err) return res.cc('获取更新用户信息失败' + err.message)
                            db.query(sql, req.user.id, (err, result) => {
                                if (err) return res.cc('获取用户信息失败')
                                res.send({
                                    status: 0,
                                    message: '获取用户信息成功',
                                    data: result[0]
                                })
                            })
                        })
                    })
                })
            })
        })
        // db.query(sql, req.user.id, (err, result) => {
        //     if (err) return res.cc('获取用户信息失败')
        //     res.send({
        //         status: 0,
        //         message: '获取用户信息成功',
        //         data: result[0]
        //     })
        // })
}

//获取用户个人信息
exports.getuserProfile = (req, res) => {
    const sql = 'select id,name,photo,mobile,gender,birthday from ev_users where id=?'
    db.query(sql, req.user.id, (err, result) => {
        if (err) return res.cc('获取用户信息失败')
        res.send({
            status: 0,
            message: '获取用户信息成功',
            data: result[0]
        })
    })
}

//修改用户个人信息
exports.updateuserProfile = (req, res) => {
    const user = req.body
    const sql = 'update ev_users set ? where id=?'
    db.query(sql, [user, req.user.id], (err, result) => {
        if (err) return res.cc('修改失败')
        if (result.affectedRows === 1) res.cc('修改成功', 1)
    })
}

//修改用户头像
exports.photo = (req, res) => {
    const sql = 'update ev_users set photo=? where id=?'
    let imagePath = req.files.photo.path
    let imageData = fs.readFileSync(imagePath)
        // 转成 base64
    let imageDataToBase64 = imageData.toString('base64')
    var decodeImg = new Buffer(imageDataToBase64, "base64") //new Buffer(string, encoding)
    fs.writeFile(`./public/${+req.user.id}photo`, decodeImg, function(err) { // 生成图片3(把base64位图片编码写入到图片文件)
        if (err) {
            console.log(err)
        }
    })
    photo = `http://127.0.0.1:3007/api/${+req.user.id}photo`
    db.query(sql, [photo, req.user.id], (err, result) => {
        if (err) return res.cc('修改失败' + err.message)
        const sql2 = 'update ev_users set aut_photo=? where aut_id=?'
        db.query(sql2, [photo, req.user.id], (err, res) => {})
        if (result.affectedRows === 1)
            res.send({
                message: '修改成功',
                data: {
                    id: req.user.id,
                    photo: photo
                }
            })
    })

}

//获取用户频道列表
exports.userChannels = (req, res) => {
    const sql = 'select id,name from user_channels where userid=?'
    db.query(sql, req.user.id, (err, result) => {
        if (err) return res.cc('获取用户频道列表失败')
        res.send({
            status: 0,
            message: '获取用户频道列表成功',
            data: { channels: result }
        })
    })
}

//添加用户频道列表
exports.addUserChannels = (req, res) => {
    const sqlname = 'select name from channels where id=?'
    db.query(sqlname, [req.body.channels[0].id], (err, result) => {
        let name = result[0].name
        const sql = 'insert into user_channels set userid=?,id=?,name=?,seq=?'
        db.query(sql, [req.user.id, req.body.channels[0].id, name, req.body.channels[0].seq], (err, result) => {
            if (err) return res.cc(err.message)
            res.send({
                status: 0,
                message: '添加用户频道列表成功',
            })
        })
    })

}

//删除用户频道列表
exports.deleteUserChannels = (req, res) => {
    const sql = 'delete from user_channels where userid=? and id=?'
    db.query(sql, [req.user.id, req.params.id], (err, result) => {
        if (err) return res.cc(err.message)
        res.send({
            status: 0,
            message: '删除用户频道列表成功',
        })
    })
}

//关注用户
exports.followings = (req, res) => {
    const sql = 'insert into user_followed set ?'
    const sqlArticle = 'update articles set is_followed=? where aut_id=? and user_id=?'
    const sqlUser = 'select * from ev_users where id=?'
    if (req.body.target != req.user.id) {
        db.query(sqlUser, req.user.id, (err, UserRes) => {
            if (err) return res.cc('获取用户信息失败')
            db.query(sqlUser, req.body.target, (err, AutRes) => {
                if (err) return res.cc('获取作者信息失败')
                db.query(sql, { id: req.user.id, photo: UserRes[0].photo, name: UserRes[0].name, aut_id: req.body.target, aut_photo: AutRes[0].photo, aut_name: AutRes[0].name }, (err, result) => {
                    if (err) return res.cc('关注用户失败')

                    db.query(sqlArticle, [true, req.body.target, req.user.id], (err, result) => {
                        if (err) return res.cc('关注用户失败')
                        res.send({
                            status: 200,
                            message: '关注用户成功',
                            data: { target: req.body.target }
                        })
                    })

                })
            })
        })

    } else {
        res.send({
            status: 400,
            message: '用户不能关注自己',
        })
    }
}

//取消关注用户
exports.UnFollowings = (req, res) => {
    const sql = 'delete from user_followed where id=? and aut_id=?'
    const sqlArticle = 'update articles set is_followed=? where aut_id=? and user_id=?'
    db.query(sql, [req.user.id, req.params.target], (err, result) => {
        if (err) return res.cc('取消关注用户失败')
        db.query(sqlArticle, [false, req.params.target, req.user.id], (err, result) => {
            if (err) return res.cc('取消关注用户失败')
            res.send({
                status: 200,
                message: '取消关注用户成功',
                data: { target: req.params.target }
            })
        })
    })
}

// 获取用户收藏列表
exports.Collected = (req, res) => {
    const sql = 'select * from articles where user_id=? and is_collected=1'
    db.query(sql, req.user.id, (err, result) => {
        if (err) return res.cc('获取用户收藏列表失败' + err.message)
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

// 获取用户历史记录
exports.history = (req, res) => {
    const sql = 'select * from articles where user_id=?'
    db.query(sql, req.user.id, (err, result) => {
        if (err) return res.cc('获取用户历史记录失败' + err.message)
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

//获取用户关注列表
exports.followList = (req, res) => {
    const sql = 'select * from user_followed where id=?'
    db.query(sql, req.user.id, (err, result) => {
        if (err) return res.cc('获取用户关注列表失败')
        res.send({
            status: 0,
            message: '获取用户关注列表成功',
            data: {
                results: result
            }
        })
    })
}

//获取用户粉丝列表
exports.fans = (req, res) => {
    const sql = 'select * from user_followed where aut_id=?'
    db.query(sql, req.user.id, (err, result) => {
        if (err) return res.cc('获取用户粉丝列表失败')
        res.send({
            status: 0,
            message: '获取用户粉丝列表成功',
            data: {
                results: result
            }
        })
    })
}

// 获取用户自己发布的文章列表
exports.myArticles = (req, res) => {
    const sql = 'select * from articles where aut_id=? and user_id=0'
    db.query(sql, req.user.id, (err, result) => {
        if (err) return res.cc('获取用户文章失败' + err.message)
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

// 获取未审核的文章列表
exports.auditArticles = (req, res) => {
    const sql = 'select * from articles where aut_id=? and user_id=0 and status=0'
    db.query(sql, req.user.id, (err, result) => {
        if (err) return res.cc('获取用户文章失败' + err.message)
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

//上传文章
exports.release = (req, res) => {
    const sqlUser = 'select * from ev_users where id=?'
    const sql = 'insert into articles set ? '
    db.query(sqlUser, req.user.id, (err, userInfo) => {
        if (err) return res.cc('获取用户信息失败')
        const predate = req.body.pubdate.replaceAll('-', '')
        console.log(predate);
        db.query(sql, {
            pre_timestamp: predate,
            title: req.body.title,
            aut_id: req.user.id,
            aut_name: userInfo[0].name,
            comm_count: 0,
            pubdate: req.body.pubdate,
            type: 0,
            channel_id: req.body.channel_id,
            user_id: 0,
            aut_photo: userInfo[0].photo,
            is_followed: 0,
            attitude: -1,
            is_collected: 0,
            content: req.body.content,
            status: 0,
        }, (err, result) => {
            if (err) return res.cc('上传文章失败' + err.message)
            if (result.affectedRows > 0) {
                res.cc('上传成功')
            }
        })
    })
}