var net = require('net');



client = net.createConnection({port:8084,host:'47.97.181.47',localPort:9000},function(){
    console.log("Connection has been created");

})


client.on('timeout',function(){
    console.log("timeout");
})




