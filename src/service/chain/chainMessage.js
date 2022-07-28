const redis = require('../../utils/redis/redis_3.0.2/redis')
const klineHandle = require('./klineStore/klineHandle')
const unsub_message = (data,processId) => {
    if (data.status == "ok") {
        //写入订阅列表
    } else {
        //将再次订阅
        console.log(data)
    }
}
const subbed_message = (data) => {
    if (data.status == "ok"){
        //写入订阅列表
        console.log("订阅成功:" + data.subbed)
    }else {
        //将再次订阅
        console.log("订阅失败:")
        console.log( data)
    }

}


const trade_message = (data) => {
    redis.setValue( 'trade:' + data.s.toLowerCase(),JSON.stringify(data))
}
const kline_message = (data) => {
    klineHandle(data)
    redis.setValue( 'kline:' + data.s.toLowerCase() + '_' + data.k.i,JSON.stringify(data.k))
}
const ticker_message = (data) => {
    data.currency = data.s.replace('USDT','/USDT');
    redis.setValue( 'ticker:' + data.s.toLowerCase(),JSON.stringify(data))
}

const depth_message = (data) => {
    redis.setValue( 'depth:' + data.s.toLowerCase(),JSON.stringify({b:data.b,a:data.a}))
}
const default_message = (data) => {
    console.log(data)
}

module.exports = {
    trade_message:trade_message,
    kline_message:kline_message,
    ticker_message:ticker_message,
    depth_message:depth_message,
    unsub:unsub_message,
    subbed:subbed_message,
    default:default_message
}