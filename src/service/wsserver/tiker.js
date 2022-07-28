const redis = require('../../utils/redis/redis_3.0.2/redis')
const wsService = require('./wsService')



const wsCommond = async (ws) => {
    ws.timerCommond = new Object()
    //检测连接
    ws.timerCommond.close = setInterval(()=>{
        wsService.timeOutExpClose(ws)
        console.log(ws.subList)
    },3000)
    //推送kline

    Object.keys(ws.subList).forEach(item=>{
        let num;
        switch (item) {
            case 'kline':
                num = 2000
                break
            case 'ticker':
                num = 500
                break
            case 'depth':
                num = 500
                break
            default:
                num = 1000
        }
        ws.timerCommond[ws.timerCommond] = setInterval(()=>{
            if (ws.subList[item]){
                redis.getValue(ws.subList[item]).then(res => {
                    if (res) {
                        let meta = JSON.parse(res)
                        wsService.wsSend(ws, meta, item)
                    }else {
                        wsService.wsSend(ws, res, item)
                    }
                })
            }
        },num)
    })
}


module.exports = wsCommond