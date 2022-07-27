const period = [
    "1m",
    "5m",
    "15m",
    "30m",
    "1h",
    "1d",
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
   "depth" : {
       "cmd": "$symbol$@depth@100ms",
       "params":[]//type
   },
   "kline" : {
       "cmd" : "$symbol$@kline_$period$",
       "params" : period
   },
   "trade" : {
       "cmd" : "$symbol$@trade",
       "params":[]//type
   }
}

module.exports = huobiCmd