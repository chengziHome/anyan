var net = require('net');
var Slice = require('../utils/tcp/slice');
var CONST = require('../utils/const');

//
// client = net.createConnection({port:8084,host:'47.97.181.47',localPort:9000},function(){
//     console.log("Connection has been created");
//
// })
//
//
// client.on('timeout',function(){
//     console.log("timeout");
// })



var subscribe = new Slice();
subscribe.setmVer(0x01);
subscribe.setmSn(1);
subscribe.setmSliceCount(1);
subscribe.setmSliceSn(0);
subscribe.setmSliceLength(CONST.TCP.SUBSCRIBE.length);
subscribe.setmLength(CONST.TCP.SUBSCRIBE.length);
subscribe.setmMsgLength(CONST.TCP.SUBSCRIBE.length);
subscribe.setmData(Buffer.from(CONST.TCP.SUBSCRIBE));

console.log(subscribe.getBuffer());
