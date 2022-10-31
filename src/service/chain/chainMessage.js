const redis = require('../../utils/redis/redis_3.0.2/redis')
const redis2 = require('../../utils/redis/redis_3.0.2/redis')
const setKlineHistory = require('./klineStore/setKlineHistory')
const unsub_message = (data, processId) => {
    if (data.status == "ok") {
        //写入订阅列表
    } else {
        //将再次订阅
        console.log('订阅列表')
    }
}
const subbed_message = (data) => {
    if (data.status == "ok") {
        //写入订阅列表
        console.log("订阅成功:" + data.subbed)
    } else {
        //将再次订阅
        console.log("订阅失败:")
    }

}


const trade_message = (data) => {
    redis.setValue('trade:' + data.s.toLowerCase(), JSON.stringify(data))
}
const kline_message = async (data) => {

    let klineData = {
        "t": data.k.t,
        "o": data.k.o,
        "h": data.k.h,
        "l": data.k.l,
        "c": data.k.c,
        "s": data.k.s,
        "i": data.k.i,
        "v": data.k.v
    }
    await redis.setValue('kline:' + data.s.toLowerCase() + '_' + data.k.i, JSON.stringify(klineData))

    await setKlineHistory(data.s.toLowerCase(), data.k.i).catch(err => {
        console.log("获取历史数据失败:>>" + data.s.toLowerCase() + "@" + data.k.i + ">>" + err.message)
    })
}
const ticker_message = (data) => {
    data.currency = data.s.replace('USDT', '/USDT');
    redis.setValue('ticker:' + data.s.toLowerCase(), JSON.stringify({
        "c": data.c,
        "o": data.o,
        "p": data.p,
        "currency": data.currency
    }))
}

const depth_message = (data) => {
    redis.setValue('depth:' + data.s.toLowerCase(), JSON.stringify({
        b: data.b,
        a: data.a
    }))
}
const default_message = (data) => {
    // console.log(data)
}

module.exports = {
    trade_message: trade_message,
    kline_message: kline_message,
    ticker_message: ticker_message,
    depth_message: depth_message,
    unsub: unsub_message,
    subbed: subbed_message,
    default: default_message
}