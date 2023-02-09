const redis        = require('redis')
const redisOptions = require('../../../config/redisConfig_3002')
const options      = (host = false,select = null) => {
    if (!select){
        select = redisOptions.db
    }
    if (redisOptions.host.search(",") == -1) {
        host = redisOptions.host;
    } else {
        if (host) {
            hostArray = redisOptions.host.split(",")
            if (hostArray[1] === '' || hostArray[1].trim().length === 0) {
                host = hostArray[0];
            } else {
                host = hostArray[1];
            }
        } else {
            hostArray = redisOptions.host.split(",")
            host      = hostArray[0]
        }
    }
    return {
        host          : host,
        port          : redisOptions.port,
        password      : redisOptions.password,
        db            : select,
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
}

// 生成redis的client
const client = (separate = false,select = null) => {
    return redis.createClient(options(separate,select))
}
// 存储值
const setValue = (key, value, expire = null,select = null) => {
    if (typeof value === 'string') {
        client(false,select).set(key, value)
        if (expire && parseInt(expire) > 0) client().expire(key, parseInt(expire));
    } else if (typeof value === 'object') {
        for (let item in value) {
            client().hmset(key, item, value[item], redis.print)
            if (expire && parseInt(expire) > 0) client().expire(key, parseInt(expire));
        }
    }
}
// 存储值
const setnx = (key, expire = 20,select = null) => {
    return new Promise((resolve, reject) => {
        client(false,select).setnx(key, key, function (err, res) {
            if (err) {
                reject(new Error(err))
            } else {
                if (res) {
                    client().expire(key, parseInt(expire))
                    resolve(true)
                } else {
                    resolve(false)
                }
            }
        })
    })


}
// 获取string
const getValue = (key,select = null) => {
    return new Promise((resolve, reject) => {
        client(true,select).get(key, (err, res) => {
            if (err) {
                reject(err)
            } else {
                resolve(res)
            }
        })
    })
}
// 获取hash
const getHValue = (key,select = null) => {
    return new Promise((resolve, reject) => {
        client(true,select).hgetall(key, function (err, value) {
            if (err) {
                reject(err)
            } else {
                resolve(value)
            }
        })
    })
}
// 集合添加
const sadd = (key, value,select = null) => {
    return new Promise((resolve, reject) => {
        if (typeof value == 'object') {
            value = JSON.stringify(value)
        }
        client(false,select).sadd(key, value, function (err, res) {
            if (err) {
                reject(err)
            } else {
                resolve(res)
            }
        })
    })
}
//获取 集合中的所有的成员
const smembers = (key,select = null) => {
    return new Promise((resolve, reject) => {
        client(true,select).smembers(key, (err, res) => {
            if (err) {
                reject(err)
            } else {
                resolve(res)
            }
        })
    })
}
//获取 集合中的一个随机元素
const srandmember = (key,select = null) => {
    return new Promise((resolve, reject) => {
        client(true,select).srandmember(key, (err, res) => {
            if (err) {
                reject(err)
            } else {
                resolve(res)
            }
        })
    })
}
//移除 集合中的一个或多个成员元素
const srem = (key, value,select = null) => {
    return new Promise((resolve, reject) => {
        client(false,select).srem(key, value, function (err, res) {
            if (err) {
                resolve(0)
            }
            resolve()
        })
    })
}
//删除 已存在的键
const del = (key,select = null) => {
    return new Promise((resolve, reject) => {
        client(false,select).del(key, function (err, res) {
            if (err) {
                reject(err)
            } else {
                resolve(res)
            }
        })
    })
}
//获取 所有符合给定模式 pattern 的 key
const keys = (value,select = null) => {
    return new Promise((resolve, reject) => {
        client(true,select).keys(value, function (err, res) {
            if (err) {
                reject(err)
            } else {
                resolve(res)
            }
        })
    })
}
//将一个或多个成员元素及其分数值加入到有序集当中。
const zadd = (args,select = null) => {
    //args = ["myzset", 1, "one", 2, "two", 3, "three", 4, "four", 5, "five", 6, "six",  8, "eg", 9, "ni",99, "",98,
    // "酒吧"];
    return new Promise((resolve, reject) => {
        client(false,select).zadd(args, function (addError, addResponse) {
            if (addError) {
                reject(addError)
            } else {
                resolve(addResponse)
            }
        });
    })
}
//获取 有序集中指定分数区间内的所有的成员。
const zrevrangebyscore = (args,select = null) => {
    return new Promise((resolve, reject) => {
        // const max = 100;
        // const min = 5;
        // const offset = 0;
        // const count = 4;
        // const args2 = ["myzset", max, min, "WITHSCORES", "LIMIT", offset, count];
        client(true,select).zrevrangebyscore(args, function (rangeError, rangeResponse) {
            if (rangeError) {
                reject(new Error(addError))
            } else {
                var data = new Array()
                if (rangeResponse.length > 0) {
                    for (var i = 1; i <= rangeResponse.length; i += 2) {
                        data.push(JSON.parse(rangeResponse[i - 1], true))
                    }
                }
                resolve(data)
            }
        });
    })
}
//移除有序集中，指定分数（score）区间内的所有成员。
const zremrangebyscore = (args,select = null) => {
    return new Promise((resolve, reject) => {
        // const args = ["klineHistory:btcusdt:1m", min,max]
        client(false,select).zremrangebyscore(args, function (rangeError, rangeResponse) {
            if (rangeError) {
                reject(new Error(addError))
            } else {
                resolve(rangeResponse)
            }
        });
    })
}
// 导出
module.exports         = {
    client:client(),
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