const express = require('express')
const router = express.Router()
const multipart = require('connect-multiparty');
const multipartMiddleware = multipart();

const userinfo_handler = require('../router_handler/userinfo')

// 获取用户基本信息
router.get('/user', userinfo_handler.getuser)

//获取用户个人信息
router.get('/user/profile', userinfo_handler.getuserProfile)

//修改用户个人信息
router.patch('/user/profile', userinfo_handler.updateuserProfile)

//修改用户头像
router.patch('/user/photo', multipartMiddleware, userinfo_handler.photo)

// 获取用户频道列表
router.get('/user/channels', userinfo_handler.userChannels)

// 添加用户频道列表
router.patch('/user/channels', userinfo_handler.addUserChannels)

// 删除用户频道列表
router.delete('/user/channels/:id', userinfo_handler.deleteUserChannels)

// 关注用户
router.post('/user/followings', userinfo_handler.followings)

// 取消关注用户
router.delete('/user/followings/:target', userinfo_handler.UnFollowings)

// 获取用户收藏列表
router.get('/user/Collected', userinfo_handler.Collected)

// 获取用户历史记录列表
router.get('/user/history', userinfo_handler.history)

// 获取用户关注列表
router.get('/user/followList', userinfo_handler.followList)

// 获取用户粉丝列表
router.get('/user/fans', userinfo_handler.fans)

// 获取用户自己发布的文章列表
router.get('/user/myArticles', userinfo_handler.myArticles)

// 获取未审核的文章列表
router.get('/user/auditArticles', userinfo_handler.auditArticles)

// 上传文章
router.post('/user/release', userinfo_handler.release)

module.exports = router