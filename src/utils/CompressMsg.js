const pako   = require('pako')
const {btoa} = require('buffer')
const CompressMsg =  (data) => {
    // return pako.gzip(btoa(JSON.stringify(data, true)), {to: "string"})
    return JSON.stringify(data, true)
}
module.exports = CompressMsg