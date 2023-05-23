const express = require('express')
const router = express.Router()

const user_handler = require('../router_handler/user')

// 注册
router.post('/regester', user_handler.regUser)

// 密码登录
router.post('/authorizations', user_handler.loginUser)

// 短信登录
router.post('/authorizationsBycode', user_handler.loginUserByCode)

module.exports = router