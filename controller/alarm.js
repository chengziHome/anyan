var net = require('net');
var xml2js = require('xml2js');
const CONST = require('../utils/const');
var Slice = require('../utils/tcp/slice');

const xmlParser = new xml2js.Parser();

var server = net.createServer();
server.listen(CONST.PORT.TCP_ALARM);
console.log('TCP server is listening at port:'+CONST.PORT.TCP_ALARM);
server.on('connection',function(sock){
    sock.on('data',function(data){
        var slice = new Slice();
        slice.init(data);
        console.log("Accept slice:"+slice);
        xmlParser.parseString(slice.mData,function(err,result){
            console.log("Accept xml:"+JSON.stringify(result));

        });
    })

})








