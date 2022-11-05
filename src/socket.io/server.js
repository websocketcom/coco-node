const {Server}    = require("socket.io");
const redis       = require("../utils/redis/redis_3.0.2/redis");
const period       = require("../config/chain/periodTime");
const pako        = require("pako");
const {btoa}      = require("buffer");
const CompressMsg = require('../utils/CompressMsg')

const socketIo = (server) => {
    const io = new Server(server, {
        pingInterval   : 5000,
        withCredentials: true,
        cors           : {
            origin: "*"
        }
    })
    io.on('connection', socket => {
        socket.on('getPush', (data) => {
            try {
                let meta = JSON.parse(data.toString());
                if (meta.hasOwnProperty('type') && meta.hasOwnProperty('sub')) {
                    var sub = meta.sub.split('@');
                    var max = ((parseInt((new Date()).getTime()/1000) / period[sub[1]]) - 1) * period[sub[1]];
                    var min = "-inf";
                    if(meta.hasOwnProperty('startTime') && meta.startTime){
                        min = meta.startTime + period[sub[1]]
                    }
                    if (min == '-inf' || min <= max){
                        switch (meta.type) {
                            case 'History':
                                var arg = ["klineHistory:" + meta.sub.replace('@', ':'), "+inf", (meta.hasOwnProperty('startTime') ? meta.startTime + period[sub[1]]: "-inf"), "WITHSCORES", "LIMIT", 0, (meta.hasOwnProperty('limit') ? meta.limit : 500)]
                                redis.zrevrangebyscore(arg).then(res => {

                                    socket.emit('History', CompressMsg({
                                                                           cid  : sub[0],
                                                                           cycle: sub[1],
                                                                           list : res
                                                                       }))
                                })
                                break;
                            case "NowList":
                                socket.emit('NowList', CompressMsg({ }))
                                break;
                            case "Message":
                                socket.emit('Message', CompressMsg({}))
                                break;
                            default:
                        }
                    }
                }
            } catch (err) {
                console.log(err)
            }
        })
        socket.on('disconnect', () => {
            console.log(socket)
            console.log('用户已断开连接')
        })
    })
    return io
}
module.exports = socketIo