// 加载node上websocket模块 ws;
const ws = require("ws");
const wsCommond = require("../service/wsserver/tiker");
const uuidv4 = require('uuid').v4
const wsMasrketSub = require('../service/wsserver/timeOutExp').wsMasrketSub
const wsserver = () => {
    // 启动基于websocket的服务器,监听我们的客户端接入进来。
    var server = new ws.Server({
        host: "0.0.0.0",
        port: 6885,
    });

// 监听接入进来的客户端事件
    function websocket_add_listener(client_sock) {
        // close事件
        client_sock.on("close", function() {
            console.log("client close");
            console.log(client_sock.uuid)
        });
        // error事件
        client_sock.on("error", function(err) {
            console.log("client error", err);
            console.log(client_sock.uuid)
        });
        client_sock.on("message", function(data) {
            let meta  = JSON.parse(data.toString());
            if (meta.type == "pong"){
                client_sock.timeOutExp = parseInt((new Date()).getTime() / 1000)
            }
            if (meta.type == "sub"){
                wsMasrketSub(client_sock,meta.data)
            }
        });
    }

    function on_server_client_comming (client_sock) {
        client_sock.uuid = uuidv4()
        client_sock.timeOutExp = parseInt((new Date()).getTime() / 1000)
        //tiker
        wsCommond(client_sock)
        console.log(client_sock.uuid)
        websocket_add_listener(client_sock);
    }

    server.on("connection", on_server_client_comming);

    function on_server_listen_error(err) {

    }
    server.on("error", on_server_listen_error);

    function on_server_headers(data) {
        console.log(data);
    }

    server.on("headers", on_server_headers);

    console.log("0.0.0.0:6885")
}

module.exports = wsserver