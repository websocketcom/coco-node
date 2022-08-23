const redis       = require('../../../utils/redis/redis_3.0.2/redis')
const tikerHandle = require("./tikerHandle")
const db          = require('../../../utils/mysql/Simple/mysql')
const KlineSQL    = require('../../../utils/mysql/modelExamples/model/kline')
const KlinesSQL   = require('../../../utils/mysql/modelExamples/model/klines')
const periodTime  = require('../../../config/chain/periodTime')


const KlineMetaHanle = async (meta) => {
    let klineStore = null
    await redis.getValue("klineStore:" + meta.s.toLowerCase() + '_' + meta.k.i).then(res => {
        klineStore = res
    })
    if (!klineStore) {
        try {
            db.query(KlineSQL.querySymbol, [meta.s.toLowerCase(), meta.k.i, 1], function (result, fields) {
                if (result.length > 0) {
                    klineStore = result[0].time
                }
                if (!klineStore) {
                    tikerHandle(meta.s.toLowerCase(), meta.k.i).then(res => {
                        if (res.length > 0) {
                            let update = []
                            update     = res.map((item) => {
                                return [parseInt(item[0] / 1000), meta.s.toLowerCase(), meta.k.i, JSON.stringify({
                                                                                                                     "time"     : item[0],
                                                                                                                     "open"     : item[1],
                                                                                                                     "high"     : item[2],
                                                                                                                     "low"      : item[3],
                                                                                                                     "close"    : item[4],
                                                                                                                     "volume"   : item[5],
                                                                                                                     "vol"      : item[7],
                                                                                                                 })]
                            })
                            update.sort((a, b) => {
                                return a[0] - b[0]
                            })
                            if (update.length > 0) {
                                db.query(KlinesSQL.insert, [update],function (result, fields) {
                                    redis.setValue("klineStore:" + meta.s.toLowerCase() + '_' + meta.k.i, parseInt(meta.k.t / 1000).toString())
                                    db.query(KlinesSQL.querySymbol, [meta.s.toLowerCase(), meta.k.i, 500], function (result, fields) {
                                        let history = [];
                                        let historyData = {};
                                        if (result.length > 0){
                                            result.forEach(item=>{
                                                let sdata = JSON.parse(item.content)
                                                historyData[parseInt(sdata.time/1000)]= sdata
                                            })
                                        }
                                        Object.keys(historyData).forEach(item=>{
                                            history.push(historyData[item])
                                        })
                                        history.sort((a,b)=>{
                                            return parseInt(b.time/1000) - parseInt(a.time/1000)
                                        })
                                        let redisData = {
                                            symbol: subMeta[0],
                                            interval: subMeta[1],
                                            data: history
                                        }
                                        redis.setValue("history:" + meta.s.toLowerCase() + ":" + meta.k.i, JSON.stringify(redisData))
                                    });
                                });
                            }
                        }
                    }).catch((err) => {
                        console.log(err)
                    })
                }


                if (klineStore && klineStore != parseInt(meta.k.t / 1000).toString()) {
                    tikerHandle(meta.s.toLowerCase(), meta.k.i, (parseInt(klineStore) - periodTime[meta.k.i]).toString() + '000').then(res => {
                        if (res.length > 0) {
                            let updateData    = []
                            let update        = []
                            let updateHistory = null
                            updateData        = res.map((item) => {
                                if (parseInt(klineStore) >= parseInt(item[0] / 1000)) {
                                    updateHistory = {
                                        "time"     : item[0],
                                        "open"     : item[1],
                                        "high"     : item[2],
                                        "low"      : item[3],
                                        "close"    : item[4],
                                        "volume"   : item[5],
                                        "vol"      : item[7],
                                    }
                                    return null
                                } else {
                                    return [parseInt(item[0] / 1000), meta.s.toLowerCase(), meta.k.i, JSON.stringify({
                                                                                                                         "time"     : item[0],
                                                                                                                         "open"     : item[1],
                                                                                                                         "high"     : item[2],
                                                                                                                         "low"      : item[3],
                                                                                                                         "close"    : item[4],
                                                                                                                         "volume"   : item[5],
                                                                                                                         "vol"      : item[7],
                                                                                                                     })]
                                }
                            })

                            if (updateData.length > 0) {
                                updateData.forEach(updateDataItem => {
                                    if (updateDataItem) {
                                        update.push(updateDataItem)
                                    }
                                })
                            }
                            update.sort((a, b) => {
                                return a[0] - b[0]
                            })
                            if (update.length > 0) {
                                db.query(KlinesSQL.insert, [update],function (result, fields) {
                                    redis.setValue("klineStore:" + meta.s.toLowerCase() + '_' + meta.k.i, parseInt(meta.k.t / 1000).toString())
                                    db.query(KlinesSQL.querySymbol, [meta.s.toLowerCase(), meta.k.i, 500], function (result, fields) {
                                        let history = [];
                                        let historyData = {};
                                        if (result.length > 0){
                                            result.forEach(item=>{
                                                let sdata = JSON.parse(item.content)
                                                historyData[parseInt(sdata.time/1000)]= sdata
                                            })
                                        }
                                        Object.keys(historyData).forEach(item=>{
                                            history.push(historyData[item])
                                        })
                                        history.sort((a,b)=>{
                                            return parseInt(b.time/1000) - parseInt(a.time/1000)
                                        })
                                        let redisData = {
                                            symbol: subMeta[0],
                                            interval: subMeta[1],
                                            data: history
                                        }
                                        redis.setValue("history:" + meta.s.toLowerCase() + ":" + meta.k.i, JSON.stringify(redisData))
                                    });
                                });
                            }

                            if (updateHistory) {
                                db.query(KlinesSQL.update, ['55', JSON.stringify(updateHistory), parseInt(updateHistory.time / 1000), meta.s.toLowerCase(), meta.k.i])
                            }
                        }
                    }).catch((err) => {
                        console.log(err)
                    })
                }

            });
        } catch (err) {
            reject(err)
        }
    } else if (klineStore && klineStore != parseInt(meta.k.t / 1000).toString()) {
        tikerHandle(meta.s.toLowerCase(), meta.k.i, (parseInt(klineStore) - periodTime[meta.k.i]).toString() + '000').then(res => {
            if (res.length > 0) {
                let updateData    = []
                let update        = []
                let updateHistory = null
                updateData        = res.map((item) => {
                    if (parseInt(klineStore) >= parseInt(item[0] / 1000)) {
                        updateHistory = {
                            "time"     : item[0],
                            "open"     : item[1],
                            "high"     : item[2],
                            "low"      : item[3],
                            "close"    : item[4],
                            "volume"   : item[5],
                            "vol"      : item[7],
                        }
                        return null
                    } else {
                        return [parseInt(item[0] / 1000), meta.s.toLowerCase(), meta.k.i, JSON.stringify({
                                                                                                             "time"     : item[0],
                                                                                                             "open"     : item[1],
                                                                                                             "high"     : item[2],
                                                                                                             "low"      : item[3],
                                                                                                             "close"    : item[4],
                                                                                                             "volume"   : item[5],
                                                                                                             "vol"      : item[7],
                                                                                                         })]
                    }
                })

                if (updateData.length > 0) {
                    updateData.forEach(updateDataItem => {
                        if (updateDataItem) {
                            update.push(updateDataItem)
                        }
                    })
                }
                update.sort((a, b) => {
                    return a[0] - b[0]
                })
                if (update.length > 0) {
                    db.query(KlinesSQL.insert, [update],function (result, fields) {
                        redis.setValue("klineStore:" + meta.s.toLowerCase() + '_' + meta.k.i, parseInt(meta.k.t / 1000).toString())
                        db.query(KlinesSQL.querySymbol, [meta.s.toLowerCase(), meta.k.i, 500], function (result, fields) {
                            let history = [];
                            let historyData = {};
                            if (result.length > 0){
                                result.forEach(item=>{
                                    let sdata = JSON.parse(item.content)
                                    historyData[parseInt(sdata.time/1000)]= sdata
                                })
                            }
                            Object.keys(historyData).forEach(item=>{
                                history.push(historyData[item])
                            })
                            history.sort((a,b)=>{
                                return parseInt(b.time/1000) - parseInt(a.time/1000)
                            })
                            let redisData = {
                                symbol: subMeta[0],
                                interval: subMeta[1],
                                data: history
                            }
                            redis.setValue("history:" + meta.s.toLowerCase() + ":" + meta.k.i, JSON.stringify(redisData))
                        });
                    });
                }
                if (updateHistory) {
                    db.query(KlinesSQL.update, ['55', JSON.stringify(updateHistory), parseInt(updateHistory.time / 1000), meta.s.toLowerCase(), meta.k.i])
                }
            }
        }).catch((err) => {
            console.log(err)
        })
    } else {
        console.log('暂无kline 更新!' + meta.k.t)
    }

}

module.exports = KlineMetaHanle