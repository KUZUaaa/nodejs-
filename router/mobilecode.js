const express = require('express')
const router = express.Router()

// 导入数据库
const db = require('../db/index')

const { randomCode, sendCode } = require('../router_handler/mobilecode');

router.get("/sms/codes", (req, res) => {
    let code = randomCode(4); //生成4位数字随机验证码
    console.log(code);
    let mobile = '19857399609'
        // let mobile = req.body.mobile
    sendCode(mobile, code, function(success) {
        console.log(success);
        if (success) {
            res.send("短信验证码已发送");
        } else {
            res.send("短信验证码发送失败");
        }
    })
    const sql = 'update ev_users set code=?where mobile=19857399609'
    db.query(sql, [code], (err, result) => {})
})

module.exports = router