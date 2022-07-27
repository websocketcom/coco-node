const redis = require('../../utils/redis/redis_3.0.2/redis')


const repeat = (func, ms) => {
    setTimeout(() => {
        func()
        repeat(func, ms)
    }, ms)
}
const wsCommond = async (ws) => {
    const chainlist = await redis.smembers('chain').then(res => {
        return res
    }).catch(err => {
        return []
    })

    if (chainlist.length <= 0) {
        return Promise.reject("chain不存在!")
    }
    repeat(() => {
        if (parseInt((new Date()).getTime() / 1000) - ws.timeOutExp > 20) {
            ws.close()
        }

        chainlist.forEach(item => {
            redis.getValue('klineUpmeta:' + item + ':market.' + item + '.ticker').then(res => {
                if (res) {
                    let data = JSON.parse(res, true);
                    data.type = "ticker"
                    data.ch = 'market.' + item + '.ticker'
                    ws.send(JSON.stringify(data, true))
                }
            })
        })

    },2000)
    repeat(() => {
        redis.getValue('wsMasrketSub:' + ws.uuid).then(res => {
            if (res) {
                let meta = JSON.parse(res)
                redis.getValue("klineUpmeta:" + meta.chain + ":market." + meta.chain + ".kline." + meta.period).then(res => {
                    if (res) {
                        let data = JSON.parse(res, true);
                        data.type = "kline"
                        data.ch = "market." + meta.chain + ".kline." + meta.period
                        ws.send(JSON.stringify(data, true))
                    }
                })
            }
        })
    },500)


}


module.exports = wsCommond