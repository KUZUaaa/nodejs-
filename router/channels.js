const express = require('express')
const router = express.Router()

const channels_handler = require('../router_handler/channels')

// 获取所有频道
router.get('/channels', channels_handler.getAllChannels)

module.exports = router