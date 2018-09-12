

module.exports=function (server) {

    const {ChatModel}=require('../db/models');
    const io=require('socket.io')(server);

    //绑定客户端连接的监听
    io.on('connection',function (socket) {
        socket.on('sendMsg',function ({from,to,content}) {
            //处理数据
            const chat_id=[from, to].sort().join("_");
            const create_time=Date.now();
            ChatModel.create({from,to,chat_id,content,create_time},function (err,chatMsg) {
                io.emit('receiveMsg',chatMsg)
            });

        })
    })
};