const {Server} = require("socket.io");
const redis = require("../utils/redis/redis_3.0.2/redis");
const pako = require("pako");
const {btoa} = require("buffer");
const socketIo = (server) => {
    const io = new Server(server,{
        pingInterval:5000,
        withCredentials: true,
        cors: {
            origin: "*"
        }
    })
    var ioList = new Array();
    io.on('connection', socket => {
        ioList.push(socket.id)
        socket.on('getPush', (data) => {
            console.log(data)
            try{
                let meta  = JSON.parse(data.toString());
                if (meta.hasOwnProperty('type') && meta.hasOwnProperty('sub')){
                    switch (meta.type){
                        case 'History':
                            // klineHistory:apeusdt:1m
                            var arg = ["klineHistory:" + meta.sub.replace('@',':'),"+inf",(meta.hasOwnProperty('startTime')?meta.startTime:"-inf"), "WITHSCORES", "LIMIT", 0, (meta.hasOwnProperty('limit')?meta.limit:500)]
                            redis.zrevrangebyscore(arg).then(res=>{
                                socket.emit('History',JSON.stringify(res))
                                // socket.emit('History',pako.gzip(btoa(JSON.stringify(res, true)), {to: "string"}))
                            })
                        default:
                    }
                }
            }catch (err){
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