const redis       = require('../../utils/redis/redis_3.0.2/redis')
const wsService   = require('./wsService')
const db          = require("../../utils/mysql/Simple/mysql");
const contronlSQL = require("../../utils/mysql/modelExamples/model/contronl");
const currency    = require('../../utils/mysql/modelExamples/model/currency')

const ControlTesting = () => {
    let nowTime = parseInt((new Date()).getTime() / 1000);
    db.query(contronlSQL.queryAll, [nowTime, nowTime], function (contronlResult, fields) {
        if (contronlResult.length) {
            db.query(currency.queryAll, ['1'], function (currencyResult, fields) {
                if (currencyResult.length > 0) {
                    currencyResult.forEach(currencyItem => {
                        contronlResult.forEach(contronlItem => {
                            if (currencyItem.id == contronlItem.cid) {
                                let code       = currencyItem.title.replace('/', '').toLowerCase()
                                let expireTime = parseInt(contronlItem.end_time) - nowTime
                                redis.setValue('contronl:' + code + '_' + contronlItem.type, contronlItem.end_time.toString(), expireTime)
                            }
                        })
                    })
                }
            });
        }
    })
}


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
                num = 2000
                break
            case 'ticker':
                num = 2000
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
    let smeta = sdata[1].split('_')
    if (smeta[1] != '5m') {
        //非5min 不单控
        redis.getValue(ws.subList.kline).then(res => {
            if (res) {
                let meta = JSON.parse(res)
                wsService.wsSend(ws, meta, 'kline')
            } else {
                wsService.wsSend(ws, res, 'kline')
            }
        })
    } else {
        //5min 单控
        redis.getValue('contronl:' + sdata[1]).then(res => {
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
}

module.exports = {
    wsCommond     : wsCommond,
    ControlTesting: ControlTesting
}