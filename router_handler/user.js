// 导入数据库
const db = require('../db/index')

// 导入加密模块
const bcrypt = require('bcryptjs')

// 导入token模块
const jwt = require('jsonwebtoken')
const config = require('../config')

// 注册
exports.regUser = (req, res) => {
    // 获取用户信息
    const userinfo = req.body

    // 对表单数据进心校验
    if (!userinfo.name || !userinfo.password) {
        return res.cc('用户名或者密码不能为空')
    }
    const sqlStr = 'select * from ev_users where mobile=?'
    db.query(sqlStr, [userinfo.mobile], (err, result) => {
        if (err) {
            return res.cc(err)
        }
        if (result.length > 0) {
            return res.cc('该手机号已注册')
        }
        // 密码加密
        userinfo.password = bcrypt.hashSync(userinfo.password, 10)

        // 插入数据的sql
        const sql = 'insert into ev_users set ?'
        db.query(sql, { name: userinfo.name, password: userinfo.password, mobile: userinfo.mobile, gender: '1', birthday: '2000-01-01', is_media: '0', art_count: 0, follow_count: '0', fans_count: '0', like_count: '0', photo: 'http://127.0.0.1:3007/api/0photo' }, (err, result) => {
            if (err) {
                return res.cc(err)
            }
            if (result.affectedRows !== 1) {
                return res.cc('用户注册失败')
            }
            const sqlid = 'select id from ev_users where mobile=?'
            db.query(sqlid, userinfo.mobile, (err, result) => {
                let userid = result[0].id
                const sqlchannels = 'insert into user_channels set ?'
                db.query(sqlchannels, { userid: userid, id: 1, name: '推荐', seq: 1 }, (err, result) => {})
            })
            res.cc('注册成功', 0)
        })

    })
}

// 登录
exports.loginUser = (req, res) => {
    // 获取用户信息
    const userinfo = req.body

    // 对表单数据进心校验
    if (!userinfo.mobile || !userinfo.password) {
        return res.cc('手机号或者密码不能为空')
    }
    const sql = 'select * from ev_users where mobile=?'
    db.query(sql, userinfo.mobile, (err, result) => {
        if (err) return res.cc(err)
        if (result.length !== 1) return res.cc('登录失败,无此用户')

        // 密码校验
        const compareResult = bcrypt.compareSync(userinfo.password, result[0].password)
        if (!compareResult) return res.cc('密码错误')

        // 生成token
        const user = {...result[0], password: '', user_pic: '' }
        const tokenStr = jwt.sign(user, config.jwtSecretKey, { expiresIn: config.expiresIn })
        res.send({
            status: 0,
            message: '登陆成功',
            data: {
                token: tokenStr
            }
        })
    })
}

//短信登录
exports.loginUserByCode = (req, res) => {
    // 获取用户信息
    const userinfo = req.body

    // 对表单数据进心校验
    if (!userinfo.mobile || !userinfo.code) {
        return res.cc('手机号或者验证码不能为空')
    }
    const sql = 'select * from ev_users where mobile=?'
    db.query(sql, userinfo.mobile, (err, result) => {
        if (err) return res.cc(err)
        if (result.length !== 1) return res.cc('登录失败,无此用户')

        // 密码校验
        if (userinfo.code != result[0].code) return res.cc('验证码登录')
            // 生成token
        const user = {...result[0], password: '', user_pic: '', code: '' }
        const tokenStr = jwt.sign(user, config.jwtSecretKey, { expiresIn: config.expiresIn })
        res.send({
            status: 0,
            message: '登陆成功',
            data: {
                token: tokenStr
            }
        })
    })
}