const {Server} = require("socket.io");
const socketIo = (server) => {
    const io = new Server(server,{
        pingInterval:5000,
        withCredentials: true,
        cors: {
            origin: "*"
        }
    })
    var ioList = new Array();
    io.on('connection', socket => {
        ioList.push(socket.id)
        console.log(io.sockets.sockets[socket.id])
        console.log(io.sockets[socket.id])
        console.log(io)
        socket.on('disconnect', () => {
            console.log(socket)
            console.log('用户已断开连接')
        })
    })
    return io
}
module.exports = socketIo