let dotenv =  require('dotenv');
dotenv.config('.env');
const redis = require('../redis_3.0.2/redis')
const periodTime = require("../../../config/chain/periodTime")
// const  client = redis.client
// client.zremrangebyscore(["klineHistory:btcusdt:1m", 1667242260,"+inf"],function (err,res) {
//         console.log(err)
//         console.log(res)
// })
//
// const args = ["myzset", 1, "one", 2, "two", 3, "three", 4, "four", 5, "five", 6, "six",  8, "eg", 9, "ni",99, "",98, "酒吧"];
// redis.zadd(args).then((res)=>{
//     console.log("su:" + res)
// }).catch((err)=>{
//     console.log("err:"+ err)
// })

// const max = "+inf";
// const min = "-inf";
// const offset = 0;
// const count = 1;
// const args2 = ["klineHistory:btcusdt:1m", max, min, "WITHSCORES", "LIMIT", offset, count];
// redis.zrevrangebyscore(args2).then(console.log)


// countHandle('btcusdt','1m')

redis.setnx('kkk').then(console.log)