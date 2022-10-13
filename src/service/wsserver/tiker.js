const redis       = require('../../utils/redis/redis_3.0.2/redis')
const wsService   = require('./wsService')

const wsCommond = async (ws) => {
    ws.timerCommond       = new Object()
    //检测连接
    ws.timerCommond.close = setInterval(() => {
        wsService.timeOutExpClose(ws)
    }, 3000)
    //推送kline

    Object.keys(ws.subList).forEach(item => {
        let num;
        switch (item) {
            case 'kline':
                num = 1000
                break
            case 'ticker':
                num = 1500
                break
            default:
                num = 1000
        }
        ws.timerCommond[ws.timerCommond] = setInterval(() => {
            if (ws.subList[item]) {
                if (item == 'kline') {
                    klineControl(ws)
                } else if (item == 'ticker') {
                    tickerSend(ws)
                } else {
                    redis.getValue(ws.subList[item]).then(res => {
                        if (res) {
                            let meta = JSON.parse(res)
                            wsService.wsSend(ws, meta, item)
                        } else {
                            wsService.wsSend(ws, res, item)
                        }
                    })
                }
            }
        }, num)
    })
}

const tickerSend = (ws) => {
    let ticker = ws.subList.ticker
    if (ticker) {
        let tickerData = ticker.split(":")
        if (tickerData[1] == 'all') {
            redis.keys("ticker:*").then(tickerRes => {
                tickerRes.forEach((tickerResItem => {
                    redis.getValue(tickerResItem).then(tickerResItemRes => {
                        let metaData = JSON.parse(tickerResItemRes)
                        wsService.wsSend(ws, metaData, 'ticker')
                    })
                }))
            })
        } else {
            redis.getValue(ticker).then(tickerRes => {
                if (tickerRes) {
                    let meta = JSON.parse(tickerRes)
                    wsService.wsSend(ws, meta, 'ticker')
                } else {
                    wsService.wsSend(ws, tickerRes, 'ticker')
                }
            })
        }
    }
}

const klineControl = (ws) => {
    let sub   = ws.subList.kline
    let sdata = sub.split(':')
    let smeta = sdata[1].replaceAll('_',':')
    let key = 'iscontrol:' + smeta
    redis.getValue(key).then(res => {
        if (res) {
            redis.getValue('klines:' + sdata[1]).then(klinesRes => {
                if (klinesRes) {
                    let meta = JSON.parse(klinesRes)
                    wsService.wsSend(ws, meta, 'kline')
                } else {
                    wsService.wsSend(ws, klinesRes, 'kline')
                }
            })
        } else {
            redis.getValue(sub).then(klinesRes => {
                if (klinesRes) {
                    let meta = JSON.parse(klinesRes)
                    wsService.wsSend(ws, meta, 'kline')
                } else {
                    wsService.wsSend(ws, klinesRes, 'kline')
                }
            })
        }
    })

}

module.exports = {
    wsCommond     : wsCommond,
    ControlTesting: ControlTesting
}