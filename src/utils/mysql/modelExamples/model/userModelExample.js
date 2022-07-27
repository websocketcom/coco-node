const db=require('../../Simple/mysql');
const userModel = require('./userModel')
// 查询实例
db.query(userModel.getUserById, [29272],function(result,fields){
    console.log('查询结果：');
    console.log(result);
});