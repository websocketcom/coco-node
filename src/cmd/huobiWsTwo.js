const cluster = require('cluster');
const chainDb = require('../service/chain/chainDb');
const setIntervalTimer = require('../service/chain/setIntervalTimeChain');
const redis = require("../utils/redis/redis_3.0.2/redis");
const connect = require("../utils/ws/client/ws");
const huobiCluster = () => {

    if (cluster.isMaster) {
        const redis = require('../utils/redis/redis_3.0.2/redis');
        redis.client.del('chain', function (err, res) {
            console.log("🐴" + res)
        });
        redis.client.del('chainSub', function (err, res) {
            console.log("🐴" + res)
        });

        chainDb().then(chain => {
            if (chain.length > 0) {
                let now = 0
                let timerInt = () => {
                    let len = chain.length
                    let nowtimer = setInterval(() => {
                        if (now > len - 1) {
                            clearInterval(nowtimer)
                        } else {
                            redis.sadd("chain", chain[now].code).then(res => {
                                console.log('🐎添加交易对:' + chain[now].code)
                                cluster.fork()
                                now++
                            })

                        }

                    }, 2000)
                }
                timerInt()
            }
            cluster.on('exit', function (worker) {
                console.log(worker.process.chainId)
                redis.srem("chainSub", worker.process.chainId).then(() => {
                    cluster.fork()
                })
            });
            cluster.on('online', function (worker) {
                redis.client.sdiff('chain', 'chainSub', function (err, res) {
                    if (err) {
                        throw new Error('数据错误!')
                    }
                    if (res.length > 0) {
                        redis.sadd("chainSub", res[0]).then(() => {
                            worker.process.chainId = res[0]
                            setTimeout(()=>{
                                throw new Error(555)
                            },2000)
                            worker.send(res[0]);
                        })
                    }
                })

            });
        })
        setIntervalTimer()
    } else if (cluster.isWorker) {
        const connect = require('../utils/ws/client/ws')// create instance
        connect(msg)
    }
}

module.exports = huobiCluster