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
        socket.on('getPush', (data) => {
            try{
                let meta  = JSON.parse(data.toString());
                if (meta.isArray() && meta.hasOwnProperty('type')){
                    switch (meta.type){
                        case 'History':

                        default:
                    }
                }
            }catch (err){
                console.log(err)
            }
        })
        socket.on('disconnect', () => {
            console.log(socket)
            console.log('用户已断开连接')
        })
    })
    return io
}
module.exports = socketIo