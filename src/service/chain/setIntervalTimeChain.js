const chainDb = require('../../service/chain/chainDb');
const redis = require("../../utils/redis/redis_3.0.2/redis");
const setIntervalTimeChain = async () => {
    console.log("检测币种!")
    let chain = await redis.smembers('chain')
    let chainDbChain = await chainDb()
    if (chain.length < chainDbChain.length && chainDbChain.length > 0) {
        chainDbChain.forEach(item => {
            if (Object.prototype.hasOwnProperty.call(item, 'code')) {
                redis.sadd("chain", item.code).then(res => {
                    console.log("币种:" + item.code + ",添加成功!")
                })
            } else {
                Promise.reject("顶级错误:币种没有code字段!")
            }
        })
    }
    return Promise.resolve()
}
const setIntervalTimer = () => {
    setInterval(() => {
        setIntervalTimeChain()
    },  60 * 1000)
}


module.exports = setIntervalTimer