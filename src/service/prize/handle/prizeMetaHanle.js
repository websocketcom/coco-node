const db=require('../../../utils/mysql/Simple/mysql');
const chainPrizeModel = require('../../../utils/mysql/modelExamples/model/chainPrize')
// 查询实例
const  insert = (prizes) => {
    return new Promise(((resolve, reject) => {
        try {
            db.query(chainPrizeModel.insert,[prizes["code"],prizes["period"],prizes["prize"],prizes["prizetime"]] ,function(result,fields){
                resolve(result)
            });
        }
        catch(err) {
            reject(err)
        }
    }))
}


const prizeMetaHanle =  (ch,klineMeta) => {
    let chs = ch.split(".")

    klineMetaClose = klineMeta.close
    let prizes = new Object()
    prizes.code = chs[1]
    prizes.period = chs[3]

    let prize = new Array()
    let one = klineMetaClose.toString().substr(0,1)
    prize.push(parseInt(one))
    let stwo = parseInt(klineMetaClose).toString()
    let two = stwo.substr(stwo.length-1,1)
    prize.push(parseInt(two))
    let sthree = klineMetaClose.toString()
    let three = sthree.substr(sthree.length - 1,1)
    prize.push(parseInt(three))
    prizes.prize = JSON.stringify(prize)
    prizes.prizetime = klineMeta.id
    insert(prizes)
    return prizes
}

module.exports = prizeMetaHanle