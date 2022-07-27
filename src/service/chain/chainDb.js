const db=require('../../utils/mysql/Simple/mysql');
const currency = require('../../utils/mysql/modelExamples/model/currency')
// 查询实例
const  result = () => {
    return new Promise(((resolve, reject) => {
        try {
            db.query(currency.queryAll,['1'] ,function(result,fields){
                result.forEach((item,index)=>{
                    result[index].code = item.title.replace('/','').toLowerCase()
                })
                resolve(result)
            });
        }
        catch(err) {
            reject(err)
        }
    }))
}

module.exports = result