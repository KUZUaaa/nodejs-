const express = require('express')
const router = express.Router()

const articles_handler = require('../router_handler/articles')

// 获取新闻推荐列表
router.get('/articles', articles_handler.getArticles)

// 获取模糊搜索列表
router.get('/suggestion', articles_handler.suggestions)

// 获取搜索结果列表
router.get('/search', articles_handler.search)

module.exports = router