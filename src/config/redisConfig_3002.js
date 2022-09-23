const options = {
    host: '10.190.0.3',
    port: 6379,
    password: '123456',
    db: 2,
    detect_buffers: true // 传入buffer 返回也是buffer 否则会转换成String
}

module.exports = options