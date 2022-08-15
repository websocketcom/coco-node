// 加载node上websocket模块 ws;
const ws = require("ws");
const {wsCommond, ControlTesting} = require("../service/wsserver/tiker");
const uuidv4 = require('uuid').v4
const wsService = require('../service/wsserver/wsService')


const wsserver = () => {
    wsService.clearHistory()
    // 启动基于websocket的服务器,监听我们的客户端接入进来。
    var server = new ws.Server({
        host: "0.0.0.0",
        port: 6812,
    });

    server.TimerControl = setInterval(()=>{
        ControlTesting()
    },5000)

// 监听接入进来的客户端事件
    function websocket_add_listener(client_sock) {
        // close事件
        client_sock.on("close", function() {
            Object.keys(client_sock.timerCommond).forEach(item=>{
                clearInterval(client_sock.timerCommond[item])
            })
            console.log("client close");
        });
        // error事件
        client_sock.on("error", function(err) {
            console.log(err)
            client_sock.close()
        });
        client_sock.on("message", function(data) {
            try{
                let meta  = JSON.parse(data.toString());
                if (meta.type == "pong"){
                    client_sock.timeOutExp = parseInt(((new Date()).getTime() / 10000))
                }else if (meta.type == "sub"){
                    wsService.wsMasrketSub(client_sock,meta)
                }else if (meta.type == "unsub"){
                    wsService.wsMasrketUnsub(client_sock,meta)
                }else{
                    wsService.wsSend(client_sock,{message:'Data cannot be parsed!',data:meta},"error",10002)
                }
            }catch (e) {
                console.log(e.message)
                wsService.wsSend(client_sock,{message:e.message},"error",10001)
            }

        });
    }

    function on_server_client_comming (client_sock) {
        client_sock.uuid = uuidv4()
        client_sock.timeOutExp = parseInt((new Date()).getTime() / 10000)
        client_sock.subList = {
            kline:null,
            ticker:null,
            trade:null,
            depth:null
        }
        wsCommond(client_sock)
        websocket_add_listener(client_sock);
    }

    server.on("connection", on_server_client_comming);

    function on_server_listen_error(err) {

    }
    server.on("error", on_server_listen_error);

    function on_server_headers(data) {
        // console.log(data);
    }

    server.on("headers", on_server_headers);

    console.log("0.0.0.0:6812")
}

module.exports = wsserver