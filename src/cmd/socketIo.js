let dotenv = require('dotenv');
dotenv.config('.env');
const express      = require('express')
const bodyparser   = require('body-parser')
const app          = express()
const http         = require('http')
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
        res.json({
                     "code": 200,
                     "data": {},
                     "msg" : ""
                 })
    })
    app.post('/push', async ({body}, res) => {
        var {
                event,
                uid,
                data
            }   = body
        var sio = io
        if (event) {
            res.send({
                         code   : 201,
                         message: "没有type值"
                     })
        }
        if (uid) {
            sio = io.sockets[uid]
        }
        if (data) {
            sio.emit(type, data)
        }
    })
    server.listen(12345, () => {
        console.log('listening on *:12345')
    })
}
module.exports     = socketServer