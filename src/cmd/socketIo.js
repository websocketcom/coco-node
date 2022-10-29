let dotenv =  require('dotenv');
dotenv.config('.env');
const express = require('express')
const app     = express()
const http    = require('http')
const server  = http.createServer(app)
const io      = require('../socket.io/server')(server)
const socketPush = require('../socket.io/socketIo')
setInterval(() => {
    socketPush.tickerSend(io)
    socketPush.klineSend(io)
}, 1000)

app.get('/', async (req, res) => {
    await io.emit('PushAll', JSON.stringify({
                                                type: "",
                                                data: {}
                                            }))
    res.json({
                 "code": 200,
                 "data": {},
                 "msg" : ""
             })
})

server.listen(12345, () => {
    console.log('listening on *:12345')
})