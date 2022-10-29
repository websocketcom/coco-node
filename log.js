const express = require('express')
const app = express()
const http = require('http')
const server = http.createServer(app)
const io = require('./src/socket.io/server')(server)

setInterval(()=>{
    io.emit('recive',JSON.stringify({'time' :(new Date()).getTime()}))
},2000)

app.get('/', async (req, res) => {
    await io.emit('PushAll',JSON.stringify({type:"",data:{}}))
    res.json({"code":200,"data":{},"msg":""})
})

server.listen(12345, () => {
    console.log('listening on *:12345')
})