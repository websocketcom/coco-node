const fetch = require('../../../utils/http/axios').fetch// create instance


const tikerHandle = async (symbol, period,startTime = null, endTime = null,size = 500, ) => {
    let ticker = null
    let error    = null
    let update = {
        "limit"   : size,
        "interval": period,
        "symbol"  : symbol.toUpperCase()
    }
    if (startTime) {
        update.startTime = startTime
    }
    if (endTime){
        update.endTime = startTime
    }
    await fetch('/api/v3/klines',update).then(res => {
        ticker = res
    }).catch(err => {
        error = err
        console.log(err)
    })
    if (error) {
        return Promise.reject(new Error(error))
    }
    return Promise.resolve(ticker)
}

module.exports = tikerHandle