const redis       = require('../../../utils/redis/redis_3.0.2/redis')
const fetch = require('../../../utils/http/axios').fetch// create instance
const periodTime = require("../../../config/chain/periodTime")
const countHandle = async (symbol, period) => {
    const max = "+inf";
    const min = "-inf";
    const offset = 0;
    const count = 1;
    const args2 = ["klineHistory:" + symbol + ":" + period, max, min, "WITHSCORES", "LIMIT", offset, count];
    var resData = {
        "have": false,
        "time": null,
    }
    try {
        var rdata = await redis.zrevrangebyscore(args2)
    } catch (e) {
        return Promise.reject(new Error(e.message))
    }
    if (rdata.length > 0) {
        if (parseInt(rdata[0].time / 1000 / periodTime[period]) != parseInt(parseInt((new Date()).getTime() / 1000) / periodTime[period])) {
            resData.have = true
            resData.time = rdata[0].time
        } else {
            return Promise.resolve(false)
        }
    }
    return Promise.resolve(resData)
}


const tikerHandle = async (symbol, period, startTime = null, endTime = null, size = 1000,) => {
    let ticker = null
    let error = null
    let update = {
        "limit": size,
        "interval": period,
        "symbol": symbol.toUpperCase()
    }
    if (startTime) {
        update.startTime = startTime
    }
    if (endTime) {
        update.endTime = startTime
    }
    await fetch('/api/v3/klines', update).then(res => {
        ticker = res
    }).catch(err => {
        error = err
    })
    if (error) {
        return Promise.reject(new Error(error))
    }
    return Promise.resolve(ticker)
}


const setKlineHistory = async (symbol, period) => {
    var countHandleData
    var KlineData = null;
    var lock = true;
    try {
        countHandleData = await countHandle(symbol, period)
        if (countHandleData && countHandleData.hasOwnProperty('have')) {
            lock = await redis.setnx("lock:setKlineHistory:" + symbol + ":" + period)
            if (!lock){
                return
            }
            if (countHandleData.have) {
                await redis.zremrangebyscore(["klineHistory:" + symbol + ":" + period, parseInt(countHandleData.time / 1000), "+inf"])
                KlineData = await tikerHandle(symbol, period, countHandleData.time)
            } else {
                KlineData = await tikerHandle(symbol,period)
            }
        }
        if (KlineData && KlineData.length > 0) {
            console.log("获取历史数据:>>" + symbol + "@" + period + ">>" + KlineData.length + "条")
            KlineData.forEach((item) => {
                var Sdata = JSON.stringify({
                    "time": item[0],
                    "open": item[1],
                    "high": item[2],
                    "low": item[3],
                    "close": item[4],
                    "volume": item[5],
                    "vol": item[7],
                })
                redis.zadd(['klineHistory:' + symbol.toLowerCase() + ':' + period, parseInt(item[0] / 1000), Sdata])
                return [parseInt(item[0] / 1000), symbol.toLowerCase(), period, Sdata]
            })
        }
    } catch (e) {
        return Promise.reject(new Error(e.message))
    }
    return Promise.resolve()

}
module.exports = setKlineHistory