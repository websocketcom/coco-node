const redis      = require('../utils/redis/redis_3.0.2/redis')
const CompressMsg      = require('../utils/CompressMsg')
const tickerSend = async (io) => {
    var ticker     = {}
    var tickerKeys = await redis.keys("ticker:*")
    for (var i = 0; i < tickerKeys.length - 1; i++) {
        await redis.getValue(tickerKeys[i]).then(tickerResItemRes => {
            let metaData                                             = JSON.parse(tickerResItemRes)
            ticker[metaData.currency.replace('/', '').toLowerCase()] = metaData
        })
    }
    io.emit('Tiker', CompressMsg(ticker))
}

const klineSend = async (io) => {
    var klineKeys = await redis.keys("kline:*")
    for (var i = 0; i < klineKeys.length - 1; i++) {
        await redis.getValue(klineKeys[i]).then(klineResItemRes => {
            let metaData                                             = JSON.parse(klineResItemRes)
            io.emit('kline', CompressMsg(metaData))
        })
    }
}
module.exports = {
    tickerSend,
    klineSend
}