const redis = require('../redis_3.0.2/redis')


redis.setValue('student', {
    name: 'xiaoming',
    age: 18,
    sex: 1
})

redis.setValue('book', 'yuwen')

redis.getValue('book').then(res => {
    console.log(res)
}).catch(err => {
    throw new Error(err)
})

redis.getHValue('student').then(res => {
    console.log(res)
}).catch(err => {
    throw new Error(err)
})