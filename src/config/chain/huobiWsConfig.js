const period = [
    "1m",
    "5m",
    "15m",
    "30m",
    "1h",
    "3m",
]
const type = [
    "5",
    "10",
    "20",
]

const huobiCmd = {
   "ticker" : {
       "cmd" : "$symbol$@ticker",
       "params" : []
   },
   "kline" : {
       "cmd" : "$symbol$@kline_$period$",
       "params" : period
   },
}

module.exports = huobiCmd