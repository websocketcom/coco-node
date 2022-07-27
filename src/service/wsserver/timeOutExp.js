const redis = require('../../utils/redis/redis_3.0.2/redis')

const timeOutExpClose = (ws) => {
    if (parseInt((new Date()).getTime() / 1000) - ws.timeOutExp){
        ws.close()
    }
}

const wsMasrketSub = (ws,data) => {
    redis.getValue("klineHistory:" + data.chain + ":market." + data.chain + ".kline." + data.period).then(res=>{
        if (res){
            let sdata = JSON.parse(res)
            sdata.type = "history"
            ws.send(JSON.stringify(sdata,true))
        }
    })
    redis.setValue('wsMasrketSub:' + ws.uuid,JSON.stringify(data),3000)
}

module.exports = {
    wsMasrketSub:wsMasrketSub,
    timeOutExpClose:timeOutExpClose
}
