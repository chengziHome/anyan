
var express = require('express');
var router = express.Router();
var model = require('./model');
const WebSocket = require('ws');



const VIDEO_STREAM_PORT = 8082;
const VIDEO_CTRL_PORT = 8081;
const ALARM_TCP = 8084;
const ALARM_WS = 8085;

const TYPE_WS = 'WS';
const TYPE_TCP = 'TCP';

const HOME_LIST = [];





// video ctrl WS Server ,port:8081
var wss = new WebSocket.Server({port:VIDEO_CTRL_PORT});
wss.on('connection',function connection(ws){
    console.log('accept connection from'+ws.address);

    ws.on('message',function incoming(data){

        console.log('message:'+data);
        var jsonData = JSON.parse(data);
        console.log('json.toString'+jsonData.toString());
        console.log('json.username' + jsonData.username);

        wss.clients.forEach(function each(client){
            if(client !== ws && client.readyState === WebSocket.OPEN){
                console.log('transmit to %s with data: %s',ws.address,jsonData);
                client.send(jsonData.username);
            }
        });
    });
});



module.exports = router;







