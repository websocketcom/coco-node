const ReconnectingWebSocket = require('reconnecting-websocket');
const websocket = require('ws');
const EventEmitter = require('events').EventEmitter;
const tool = require('../../tools/tool')
const chainMessage = require('../../../service/chain/chainMessage')
const  chainInt = require('../../../service/chain/chain')// create instance
const  huobiSub = require('../../../service/chain/huobiSub')// create instance


class ConnectWebSocket extends EventEmitter {
    constructor(url) {
        super();
        this.url = url;
        this.init();
        this.isonload = 0;
        chainInt();
        this.processId = null;
        this.IntervalTimer = null;
    }

    init() {
        this.ws = null;
    }

    connectServer(type, listener) {
        this.ws = new ReconnectingWebSocket(this.url, [], {
            maxReconnectionDelay: 5000,
            WebSocket: websocket
        });
        this.ws.addEventListener('open', this.open);
        this.ws.addEventListener('close', this.close);
        this.ws.addEventListener('message', this.message);
    }
    setProcessId = (processId) => {
        this.processId = processId
    }
    open = () => {
        this.isonload = 1;
        huobiSub(this.send,this.processId)
        this.IntervalTimer = setInterval(()=>{
            huobiSub(this.send,this.processId)
        },10 * 60 * 1000)
        console.log('连接成功>[' + this.processId + ']');
    }

    close() {
        clearInterval(this.IntervalTimer)
        console.log('连接已断开>[' + this.processId + ']');
    }

    message = (msg) => {
        let that = this
        let data = {}
        if ( tool.isJSON(msg.data)) data = tool.jsonParse(msg.data)
        if (data.hasOwnProperty('e')){
            if ( data.e == "trade"){
                chainMessage.trade_message(data,that.processId)
            }
            if ( data.e == "kline"){
                chainMessage.kline_message(data,that.processId)
            }
            if ( data.e == "24hrTicker"){
                chainMessage.ticker_message(data,that.processId)
            }
            if ( data.e == "depthUpdate"){
                chainMessage.depth_message(data,that.processId)
            }
        }
    }

    send = (msg) => {
        this.ws.send(JSON.stringify(msg));
    }

}

const connect = (processId) => {
    let connect = new ConnectWebSocket('wss://stream.binance.com:9443/ws');
    connect.setProcessId(processId)
    connect.connectServer();
    return connect
}

module.exports = connect