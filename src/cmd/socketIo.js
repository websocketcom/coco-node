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
    const timer  = () => {
        setTimeout(() => {
            timer()
            socketPush.tickerSend(io)
            socketPush.klineSend(io)
        }, 995)
    }
    timer()

    app.use(bodyparser.json())

    app.post('/', async (req, res) => {
        res.json({
                     "code": 200,
                     "data": {},
                     "msg" : ""
                 })
    })
    app.post('/push', async ({body}, res) => {
        var {
                event,
                data
            }   = body
        var sio = io
        if (!event) {
            res.send({
                         code   : 201,
                         message: "没有event值"
                     })
        }
        // if (uid !== undefined) {
        //     sio = io.sockets[uid]
        // }
        if (data) {
            sio.emit(event, data)
        }
        res.json(body)
    })
    server.listen(12345, () => {
        console.log('listening on *:12345')
    })
}
module.exports     = socketServer