const period = [
    "1min",
    "5min",
    "15min",
    "30min",
    "60min",
    "4hour",
    "1day",
    "1mon",
    "1week"
]

const getperiod = () =>{
    return new Promise((resolve, reject) => {
        resolve(period)
    })
}

module.exports = getperiod