const os = require('os');
///////////////////获取本机ip///////////////////////
const getIPAdress = async function() {
    var interfaces = os.networkInterfaces();
    var address = []

    for (var devName in interfaces) {
        var iface = interfaces[devName];
        for (var i = 0; i < iface.length; i++) {
            var alias = iface[i];
            if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal) {
                address.push(alias.address) ;
            }
        }
    }
    return Promise.resolve(address)
}
module.exports = {
    getIPAdress:getIPAdress
}