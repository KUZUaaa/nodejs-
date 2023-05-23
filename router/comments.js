const express = require('express')
const router = express.Router()

const comments_handler = require('../router_handler/comments')

// 发表评论
router.post('/comments', comments_handler.addComments)

// 获取评论
router.get('/comments', comments_handler.getComments)

// 点赞评论
router.post('/comment/likings', comments_handler.likeComments)

// 取消点赞评论
router.delete('/comment/likings/:target', comments_handler.UnlikeComments)

module.exports = router