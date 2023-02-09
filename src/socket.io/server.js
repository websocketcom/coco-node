const {Server}    = require("socket.io");
const redis       = require("../utils/redis/redis_3.0.2/redis");
const redis2       = require("../utils/redis/redis_3.0.2/redis2");
const period      = require("../config/chain/periodTime");
const CompressMsg = require('../utils/CompressMsg')
const timeType = {
    '1m': 60,
    '3m': 180,
    '5m': 300,
    '15m': 900,
    '30m': 1800,
    '1h': 3600,
    '1d': 86400,
}
const getTimeDate = (Timezone = null) => {
    let date = null
    if (Timezone) {
        date = new Date(Timezone)
    } else {
        date = new Date()
    }
    let Year = date.getFullYear().toString()
    let Month = (date.getUTCMonth() + 1).toString()
    if (Month.length == 1) {
        Month = `0${Month}`
    }
    let Day = date.getDate().toString()
    if (Day.length == 1) {
        Day = `0${Day}`
    }
    return `${Year}${Month}${Day}`
}
const getTypeTime = (type = "1m") => {
    let time = parseInt((new Date()).getTime() / 1000);
    let now = parseInt(time / timeType[type])
    return {
        "last": (now - 1) * timeType[type],
        "now": now * timeType[type],
        "second": (now + 1) * timeType[type]
    }
}
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
                            let BuyStatusType = getTypeTime(BuyStatusSub[1])
                            let BuyStatusDate = getTimeDate()
                            let BuyStatusList = await redis2.zrevrangebyscore(["order:" + BuyStatusDate + ":" + BuyStatusSub[1] + ":" + BuyStatusSub[0], BuyStatusType.second, BuyStatusType.last, "WITHSCORES", "LIMIT", 0, 3])
                            let BuyStatusListData = {
                                "last": [],
                                "now": [],
                                "second": []
                            }
                            if (BuyStatusList) {
                                BuyStatusList.forEach(item => {
                                    let itemData = item
                                    Object.keys(BuyStatusType).forEach((iitem)=>{
                                        if (itemData.begin_time == BuyStatusType[iitem]){
                                            BuyStatusListData[iitem] = itemData
                                        }
                                    })
                                })
                            }
                            socket.emit('BuyStatus', CompressMsg({
                                                                     cid: BuyStatusSub[0],
                                                                     cycle: BuyStatusSub[1],
                                                                     list: []//BuyStatusListData
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