// 导入数据库
const db = require('../db/index')

exports.getAllChannels = (req, res) => {
    const sql = 'select * from channels'
    db.query(sql, (err, result) => {
        if (err) return res.cc('获取频道列表失败')
        res.send({
            status: 0,
            message: '获取频道列表成功',
            data: { channels: result }
        })
    })
}