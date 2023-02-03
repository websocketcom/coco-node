const {Server}    = require("socket.io");
const redis       = require("../utils/redis/redis_3.0.2/redis");
const period      = require("../config/chain/periodTime");
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
        socket.on('getPush',async (data) => {
            try {
                let meta = JSON.parse(data.toString());
                if (meta.hasOwnProperty('type') && meta.hasOwnProperty('sub')) {
                    switch (meta.type) {
                        case 'History':
                            lock = await redis.setnx("KlineLock:" +meta.sub + ":" + socket.id,2)
                            if (!lock){
                                return
                            }
                            let sub = meta.sub.split('@');
                            let max = ((parseInt((new Date()).getTime() / 1000) / period[sub[1]]) - 1) * period[sub[1]];
                            let min = "-inf";
                            if (meta.hasOwnProperty('startTime') && meta.startTime) {
                                min = Number(meta.startTime) + period[sub[1]]
                            }
                            if (min == '-inf' || min <= max) {
                                let arg = ["klineHistory:" + meta.sub.replace('@', ':'), "+inf", min, "WITHSCORES", "LIMIT", 0, (meta.hasOwnProperty('limit') ? meta.limit : 500)]
                                redis.zrevrangebyscore(arg).then(res => {
                                    socket.emit('History', CompressMsg({
                                                                           cid  : sub[0],
                                                                           cycle: sub[1],
                                                                           list : res
                                                                       }))
                                })
                            }
                            break;
                        case "NowList":
                            socket.emit('NowList', CompressMsg({}))
                            break;
                        case "Message":
                            let MessageSub = meta.sub.split('@');
                            socket.emit('Message', CompressMsg({}))
                            break;
                        case "BuyStatus":
                            let BuyStatusSub = meta.sub.split('@');
                            socket.emit('BuyStatus', CompressMsg({
                                                                   cid  : BuyStatusSub[0],
                                                                   cycle: BuyStatusSub[1],
                                                                   list : {}
                                                               }))
                            break;
                        default:
                    }
                }
            } catch (err) {
                console.log(err.message);
            }
        })
        socket.on('disconnect', () => {
            console.log('用户已断开连接')
        })
    })
    return io
}
module.exports = socketIo