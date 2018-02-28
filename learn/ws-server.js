var WebSocket = require('ws');
var fs = require('fs');



var wss = new WebSocket.Server({port:8082});
console.log("WS(8081) is running ...")
wss.on('connection',function connection(ws){
    console.log('accept connection from'+ws.address);
    ws.on('message',function incoming(data){
        console.log("type:"+typeof(data));
        console.log("data:"+data);

        fs.readFile('/home/chengzi/Pictures/x5.jpg','utf-8',function(err,data){
            console.log("img:"+data.length);
            ws.send(data,{binary:true});
        })

    });
});








