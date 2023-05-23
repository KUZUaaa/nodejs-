const express = require('express')
const router = express.Router()

const articles_content_handler = require('../router_handler/articles_content')

// 获取新闻详情内容未登录
router.get('/articles/:article_id', articles_content_handler.getArticlesContent)

// 文章审核通过
router.get('/auditPassArticles/:article_id', articles_content_handler.auditPassArticles)

// 文章审核未通过
router.get('/auditRefuseArticles/:article_id', articles_content_handler.auditRefuseArticles)

// 收藏文章
router.post('/article/collections', articles_content_handler.collections)

// 取消收藏文章
router.delete('/article/collections/:target', articles_content_handler.UnCollections)

// 点赞文章
router.post('/article/likings', articles_content_handler.likeing)

// 取消点赞文章
router.delete('/article/likings/:target', articles_content_handler.UnLikeing)

module.exports = router