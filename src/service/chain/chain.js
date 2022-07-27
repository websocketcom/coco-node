
const huobiCmd = require('../../config/chain/huobiWsConfig')
const chainDb = require('./chainDb')
const redis = require('../../utils/redis/redis_3.0.2/redis')


const chainListInit = () => {
    chainDb().then(res=>{
        let huobidata = new Object();

        res.forEach(item=>{
            let kline = [];
            let ticker = [];
            let trade = [];
            let depth = [];
            //kline
            let klineCmd =  huobiCmd.kline.cmd.replace("$symbol$", item.code)
            huobiCmd.kline.params.forEach(periodItem=>{
                kline.push(klineCmd.replace("$period$", periodItem))
            })

            //depth
            let depthCmd =  huobiCmd.depth.cmd.replace("$symbol$", item.code)
            depth.push(depthCmd)
            // huobiCmd.depth.type.forEach(typeItem=>{
            //     depth.push(depthCmd.replace("$type$", typeItem))
            // })

            //ticker
            let tickerCmd =  huobiCmd.ticker.cmd.replace("$symbol$", item.code)
            ticker.push(tickerCmd)

            //ticker
            let tradeCmd =  huobiCmd.trade.cmd.replace("$symbol$", item.code)
            trade.push(tradeCmd)

            huobidata[item.code] = {
                kline:kline,
                ticker:ticker,
                depth:depth,
                trade:trade
            }
        })

        // console.log(huobidata)
        redis.setValue('huobidata', JSON.stringify(huobidata))

    })
}

module.exports = chainListInit


