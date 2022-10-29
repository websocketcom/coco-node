const express = require('express')
const app = express()
const http = require('http')
const server = http.createServer(app)
const io = require('./src/socket.io/server')(server)



// 处理 HTTP 协议的使用 Express 的 app 实例



setInterval(()=>{
    io.emit('recive',JSON.stringify({'time' :(new Date()).getTime()}))
},2000)

app.get('/', (req, res) => {
    res.json({"code":200,"data":{},"msg":""})
})

server.listen(12345, () => {
    console.log('listening on *:12345')
})