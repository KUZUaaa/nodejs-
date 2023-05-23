// 导入express
const express = require('express')
const app = express()


// 导入cors中间件  跨域
const cors = require('cors')
app.use(cors())

//静态资源
app.use('/api', express.static('./public'));


//解析x-www-form-urllencoded格式
app.use(express.urlencoded({ extended: false }))

const bodyParser = require('body-parser');
app.use(bodyParser.json()); //数据JSON类型
app.use(bodyParser.urlencoded({ extended: false })); //解析post请求数据

// res.cc接口调用失败
app.use((req, res, next) => {
    res.cc = function(err, status = 400) {
        res.send({
            status,
            message: err instanceof Error ? err.message : err
        })
    }
    next()
})

// 解析token的中间件
const expressJWT = require('express-jwt')
const config = require('./config')

app.use(expressJWT({ secret: config.jwtSecretKey }).unless({ path: [/^\/api/] }))

//导入使用用户模块
const userRouter = require('./router/user')
app.use('/api', userRouter)

// 导入获取个人信息模块
const userinfoRouter = require('./router/userinfo')
app.use('/v1_0', userinfoRouter)

// 导入获取获取验证码模块
const mobilecode = require('./router/mobilecode')
app.use('/api', mobilecode)

// 导入频道列表模块
const channels = require('./router/channels')
app.use('/api', channels)

// 导入文章模块
const articles = require('./router/articles')
app.use('/api', articles)

// 导入文章详情模块
const articles_content = require('./router/articles_content')
app.use('/v1_0', articles_content)

// 导入评论模块
const comments = require('./router/comments')
app.use('/v1_0', comments)

// 错误级别的中间件
app.use((err, req, res, next) => {
    //token认证失败
    if (err.name === 'UnauthorizedError') return res.cc('身份认证失败')
    res.cc(err)
    next()
})

// 启动服务器
app.listen(3007, () => {
    console.log('running at http://127.0.0.1:3007');
})