const zlib = require('zlib');

const bufferUnzip =  (buffer) => {
   return  new Promise((resolve, reject) => {
        if (!Buffer.isBuffer(buffer)){
            reject('Please provide buffer objects')
        }
        let data =  Buffer.from(buffer).toString('base64');
    
        zlib.unzip(new Buffer(data,'base64'), function(err, buffer) {
            if (!err) {
                resolve(buffer.toString())
            }else {
                reject(err)
            }
        });
    });

}

const isJSON = (str) => {
    if (typeof str == 'string') {
        try {
            var obj=JSON.parse(str);
            if(typeof obj == 'object' && obj ){
                return true;
            }else{
                return false;
            }
            
        } catch(e) {
            return false;
        }
    }
    return false
}

const jsonParse = (str) => {
    if (isJSON(str)) {
        try {
            let res = JSON.parse(str)
            if (typeof res == 'object' && Object.keys(res).length > 1){
                Object.keys(res).forEach(item =>{
                    res[item] = jsonParse(res[item])
                })
            }
            return res
        } catch(e) {
            return str
        }
    }else {
        return str
    }
}


module.exports = {
    bufferUnzip:bufferUnzip,
    isJSON:isJSON,
    jsonParse:jsonParse
}