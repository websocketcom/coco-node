const options = {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    password: process.env.REDIS_PWD,
    db: process.env.REDIS_SELECT,
    detect_buffers: true // 传入buffer 返回也是buffer 否则会转换成String
}

module.exports = options