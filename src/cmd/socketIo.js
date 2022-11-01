let dotenv = require('dotenv');
dotenv.config('.env');
const express = require('express')
const bodyparser = require('body-parser')
const app     = express()
const http    = require('http')
const socketPush   = require('../socket.io/socketIo')
const ioServer     = require('../socket.io/server')
const socketServer = () => {
    const server = http.createServer(app)
    const io     = ioServer(server)

    setInterval(() => {
        socketPush.tickerSend(io)
        socketPush.klineSend(io)
    }, 1000)
    app.use(bodyparser.json())

    app.post('/', async (req, res) => {
        console.log(req.body)
        // var resData =
        // await io.emit('PushAll', JSON.stringify({
        //                                             type: "",
        //                                             data: {}
        //                                         }))
        res.json({
                     "code": 200,
                     "data": {},
                     "msg" : ""
                 })
    })
    app.post('/push',async ({body}, res) => {
        res.json(body)
    })
    server.listen(12345, () => {
        console.log('listening on *:12345')
    })
}
module.exports     = socketServer