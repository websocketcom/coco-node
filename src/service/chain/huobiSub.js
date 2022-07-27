const redis = require('../../utils/redis/redis_3.0.2/redis')
const string64to10 = (number_code) => {
    var chars = '0123456789abcdefghigklmnopqrstuvwxyzABCDEFGHIGKLMNOPQRSTUVWXYZ-~',
        radix = chars.length,
        number_code = String(number_code),
        len = number_code.length,
        i = 0,
        origin_number = 0;
    while (i < len) {
        origin_number += Math.pow(radix, i++) * chars.indexOf(number_code.charAt(len - i) || 0);
    }
    return origin_number;
}
const huobiSub = (send, processId) => {
    redis.getValue('huobidata').then(res => {
        let huobisub  = {
            "method": "SUBSCRIBE",
            "params":
                [
                ],
            "id"    : 2
        }
        let huobimeta = JSON.parse(res)
        if (huobimeta && huobimeta.hasOwnProperty(processId)) {
            let huobidata = huobimeta[processId]

            Object.keys(huobidata).forEach(item => {
                if (huobidata[item].length > 0){
                    huobidata[item].forEach(sitem=>{
                        huobisub.params.push(sitem)
                    })
                }
            })
            huobisub.id = string64to10('0x' + processId)
            send(huobisub)
        } else {
            throw new Error("币种数据有误!")
        }
    }).catch(err => {
        throw new Error(err)
    })
}

module.exports = huobiSub