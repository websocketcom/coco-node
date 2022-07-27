// 加载node上websocket模块 ws;
var ws = require("ws");

// 启动基于websocket的服务器,监听我们的客户端接入进来。
var server = new ws.Server({
    host: "127.0.0.1",
    port: 6080,
});

// 监听接入进来的客户端事件
function websocket_add_listener(client_sock) {
    // close事件
    client_sock.on("close", function() {
        console.log("client close");
    });

    // error事件
    client_sock.on("error", function(err) {
        console.log("client error", err);
    });

    client_sock.on("message", function(data) {
        console.log(data.toString());

    });
}

function on_server_client_comming (client_sock) {
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