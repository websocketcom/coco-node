const redis = require('redis')
const redisOptions = require('../../../config/redisConfig_3002')
const options = {
    host: redisOptions.host,
    port: redisOptions.port,
    password: redisOptions.password,
    db: redisOptions.db,
    detect_buffers: redisOptions.detect_buffers, // 传入buffer 返回也是buffer 否则会转换成String
    retry_strategy: function (options) {
        // 重连机制
        if (options.error && options.error.code === "ECONNREFUSED") {
            // End reconnecting on a specific error and flush all commands with
            // a individual error
            return new Error("The server refused the connection");
        }
        if (options.total_retry_time > 1000 * 60 * 60) {
            // End reconnecting after a specific timeout and flush all commands
            // with a individual error
            return new Error("Retry time exhausted");
        }
        if (options.attempt > 10) {
            // End reconnecting with built in error
            return undefined;
        }
        // reconnect after
        return Math.min(options.attempt * 100, 3000);
    }
}

// 生成redis的client
const client = redis.createClient(options)

// 存储值
const setValue = (key, value, expire = null) => {

    if (typeof value === 'string') {
        client.set(key, value)
        if (expire && parseInt(expire) > 0) client.expire(key, parseInt(expire));

    } else if (typeof value === 'object') {
        for (let item in value) {
            client.hmset(key, item, value[item], redis.print)
            if (expire && parseInt(expire) > 0) client.expire(key, parseInt(expire));
        }
    }
}

// 存储值
const setnx = (key, expire = 10) => {
    return new Promise((resolve, reject) => {
        client.setnx(key, key,function (err,res) {
            if (err){
                reject(new Error(err))
            }else {
                if (res){
                    client.expire(key, parseInt(expire))
                    resolve(true)
                }else {
                    resolve(false)
                }
            }
        })
    })


}

// 获取string
const getValue = (key) => {
    return new Promise((resolve, reject) => {
        client.get(key, (err, res) => {
            if (err) {
                reject(err)
            } else {
                resolve(res)
            }
        })
    })
}


// 获取hash
const getHValue = (key) => {
    return new Promise((resolve, reject) => {
        client.hgetall(key, function (err, value) {
            if (err) {
                reject(err)
            } else {
                resolve(value)
            }
        })
    })
}

// 集合添加
const sadd = (key, value) => {
    return new Promise((resolve, reject) => {
        if (typeof value == 'object') {
            value = JSON.stringify(value)
        }
        client.sadd(key, value, function (err, res) {
            if (err) {
                reject(err)
            } else {
                resolve(res)
            }
        })
    })
}
const smembers = (key) => {
    return new Promise((resolve, reject) => {
        client.smembers(key, (err, res) => {
            if (err) {
                reject(err)
            } else {
                resolve(res)
            }
        })
    })
}
const srandmember = (key) => {
    return new Promise((resolve, reject) => {
        client.srandmember(key, (err, res) => {
            if (err) {
                reject(err)
            } else {
                resolve(res)
            }
        })
    })
}
const srem = (key, value) => {
    return new Promise((resolve, reject) => {
        client.srem(key, value, function (err, res) {
            if (err) {
                resolve(0)
            }
            resolve()
        })
    })
}
const del = (key) => {
    return new Promise((resolve, reject) => {
        client.del(key, function (err, res) {
            if (err) {
                reject(err)
            } else {
                resolve(res)
            }
        })
    })
}

const keys = (value) => {
    return new Promise((resolve, reject) => {
        client.keys(value, function (err, res) {
            if (err) {
                reject(err)
            } else {
                resolve(res)
            }
        })
    })
}
const zadd = (args) => {
    //args = ["myzset", 1, "one", 2, "two", 3, "three", 4, "four", 5, "five", 6, "six",  8, "eg", 9, "ni",99, "",98, "酒吧"];
    return new Promise((resolve, reject) => {
        client.zadd(args, function (addError, addResponse) {
            if (addError) {
                reject(addError)
            } else {
                resolve(addResponse)
            }
        });
    })
}

const zrevrangebyscore = (args) => {
    // const max = 100;
// const min = 5;
// const offset = 0;
// const count = 4;
// const args2 = ["myzset", max, min, "WITHSCORES", "LIMIT", offset, count];
    return new Promise((resolve, reject) => {
        client.zrevrangebyscore(args, function (rangeError, rangeResponse) {
            if (rangeError) {
                reject(new Error(addError))
            } else {
                var data = new Array()
                if (rangeResponse.length > 0) {
                    for (var i = 1;i<=rangeResponse.length;i+=2){
                        data.push(JSON.parse(rangeResponse[i-1],true))
                    }
                }
                resolve(data)
            }
        });
    })
}

const zremrangebyscore = (args) => {
// const args = ["klineHistory:btcusdt:1m", min,max]
    return new Promise((resolve, reject) => {
        client.zremrangebyscore(args, function (rangeError, rangeResponse) {
            if (rangeError) {
                reject(new Error(addError))
            } else {
                resolve(rangeResponse)
            }
        });
    })
}
// 导出
module.exports = {
    client,
    keys,
    setValue,
    getValue,
    getHValue,
    sadd,
    smembers,
    srandmember,
    srem,
    del,
    zadd,
    setnx,
    zrevrangebyscore,
    zremrangebyscore
}