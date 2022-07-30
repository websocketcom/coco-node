const redis  = require('../../utils/redis/redis_3.0.2/redis')
const {btoa} = require('buffer')
const pako = require('pako')
const db = require("../../utils/mysql/Simple/mysql");
const KlinesSQL = require("../../utils/mysql/modelExamples/model/klines");

const timeOutExpClose = (ws) => {
    if (parseInt((new Date()).getTime() / 10000) - Number(ws.timeOutExp) > 6) {
        ws.close()
    }
}

const wsSend = (ws, data, type = 'msg', code = 200) => {
    let resultData = {
        type: type,
        code: code,
        data: data
    }
    resultData = pako.gzip(btoa(JSON.stringify(resultData, true)), {to: "string"})
    ws.send(resultData);
    // ws.send(JSON.stringify(resultData, true));
}

const wsMasrketSub = (ws, data) => {
    let sub = data.sub.split(':')
        if (ws.subList.hasOwnProperty(sub[0])) {
            if (sub[0] == 'kline' || sub[0] == 'history') {
                let subMeta = sub[1].split('_')
                db.query(KlinesSQL.querySymbol, [subMeta[0].toLowerCase(), subMeta[1], 500], function (result, fields) {
                    let history = [];
                    let historyData = {};
                    if (result.length > 0){
                        result.forEach(item=>{
                            let sdata = JSON.parse(item.content)
                            historyData[parseInt(sdata.time/1000)]= sdata
                        })
                    }
                    Object.keys(historyData).forEach(item=>{
                        history.push(historyData[item])
                    })
                    history.sort((a,b)=>{
                        return parseInt(b.time/1000) - parseInt(a.time/1000)
                    })
                    let resultData = {
                        symbol: subMeta[0],
                        interval: subMeta[1],
                        data: history
                    }
                    wsSend(ws, resultData, "history")
                })
            }
            ////需要判断
            if (sub[0] != 'history'){
                ws.subList[sub[0]] = data.sub
            }
            let resultData = {
                'subed': data.sub,
                'id': data.id || ''
            }
            wsSend(ws, resultData, "subed")
        }
}

const wsMasrketUnsub = (ws, data) => {
    let unsub = data.unsub.split(':')
    if (ws.subList.hasOwnProperty(unsub[0]) && ws.subList[unsub[0]]){
        ws.subList[unsub[0]] = null
        let resultData = {
            'unsubed': data.unsub,
            'id'   : data.id || '',
        }
        wsSend(ws,resultData,"unsubed")
    }else {
        let resultData = {
            'unsubed': data.unsub,
            'id'   : data.id || '',
            'msg'    : 'Wrong cancellation!'
        }
        wsSend(ws,resultData,"unsubed",10003)
    }
}

const removeSub    = (key) => {
    redis.del('wsMemberSub:' + key)
}
const clearHistory = () => {
    redis.keys("wsMemberSub:*").then(res => {
        if (res.length > 0) {
            res.forEach(item => {
                redis.del(item)
            })
        }
    })
}
module.exports     = {
    wsMasrketSub   : wsMasrketSub,
    wsMasrketUnsub : wsMasrketUnsub,
    timeOutExpClose: timeOutExpClose,
    removeSub      : removeSub,
    clearHistory   : clearHistory,
    wsSend:wsSend
}
