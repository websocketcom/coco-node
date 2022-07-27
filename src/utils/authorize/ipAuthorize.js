const getIPAdress = require("../os/local").getIPAdress
const authorizeIp = ['103.86.47.17', '103.86.45.35', '192.168.43.11', '185.227.70.217', '185.227.70.217',"192.168.0.127","192.168.1.12"]
const ipAuthorize = async () => {
    var ipAuthorizeArr = null;
    var ipAuthorize = false;
    await getIPAdress().then(res => {
        ipAuthorizeArr = res
    })

    if (!ipAuthorizeArr){
        return Promise.reject("没有授权Ip!")
    }

    authorizeIp.forEach(item => {
        if (ipAuthorizeArr.includes(item)) {
            ipAuthorize = true
        }
    })

    if (ipAuthorize){
        return Promise.resolve()
    }else {
        return Promise.reject("你的IP没有被授权!")
    }
}

module.exports = {
    ipAuthorize:ipAuthorize
}
