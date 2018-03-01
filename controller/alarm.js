var net = require('net');
var fs = require('fs');
var path = require('path');
var xml2js = require('xml2js');
var WebSocket = require('ws');
const CONST = require('../utils/const');
var Slice = require('../utils/tcp/slice');
var Alarm = require('../utils/tcp/alarm');
var Home = require('../utils/user/home');
var HomeUtil = require('../utils/user/home-util');


const REC_HEADER = CONST.TCP.REC_HEADER;
const REC_DATA = CONST.TCP.REC_DATA;
const HEADER_LENGTH = CONST.TCP.HEADER_LENGTH;
const HOME = CONST.HOME;


const xmlParser = new xml2js.Parser();
const xmlBuilder = new xml2js.Builder();
var tcpServer = null;
var wss = null;

var count = 0;

var log_count = 0;


class AlarmController {

    init(req, res, next) {
        if(tcpServer==null){
            initTcp();
        }
        if(wss==null){
            initAlarmWS();
        }
        res.send("Init alarm server Ok");

    }


}


module.exports = AlarmController;

function initTcp() {
    tcpServer = net.createServer();
    tcpServer.listen(CONST.PORT.TCP_ALARM,'0.0.0.0');
    console.log('TCP server is listening at port:' + CONST.PORT.TCP_ALARM);
    tcpServer.on('connection', function (sock) {
        HOME.alarm_home_tcp = sock;
        sock.on('data', function (data) {
            console.log("Accept data:" + count++ + ",len:" + data.length);


            var mPackState = HOME.mPackState;
            var mRecvBuf = HOME.mRecvBuffer;

            var dataBuff = data;
            var dataSize = data.length;
            //解析slice.
            if (mRecvBuf != null) {
                dataSize += mRecvBuf.length;
                dataBuff = Buffer.from(mRecvBuf, dataBuff);

                HOME.mRecvBuffer = null;
            }
            var dataPos = 0;
            var leftSize = dataSize;
            var isEnough = true;

            var tmp_slice = new Slice();
            while (isEnough) {
                switch (mPackState) {
                    case REC_HEADER: {
                        if (leftSize < HEADER_LENGTH) {
                            if (leftSize) {
                                HOME.mRecvBuffer = Buffer.from(dataBuff.slice(dataPos));
                            } else {
                                HOME.mRecvBuffer = null;
                            }
                            isEnough = false;
                        } else {
                            tmp_slice.init(Buffer.from(dataBuff.slice(dataPos, dataPos + HEADER_LENGTH)));

                            dataPos += HEADER_LENGTH;
                            leftSize -= HEADER_LENGTH;
                            mPackState = REC_DATA;
                        }

                    }
                        break;
                    case REC_DATA: {
                        if (leftSize < tmp_slice.mSliceLength) {
                            if (leftSize < tmp_slice.mSliceLength) {
                                HOME.mRecvBuffer = Buffer.from(dataBuff.slice(dataPos));
                            } else {
                                HOME.mRecvBuffer = null;
                            }
                            isEnough = false;
                        } else {
                            var offset = tmp_slice.mSliceLength;
                            tmp_slice.setmData(Buffer.from(dataBuff.slice(dataPos, dataPos + offset)));
                            HOME.mPackSlices.push(tmp_slice);
                            if (tmp_slice.mSliceCount - 1 == tmp_slice.mSliceSn) {
                                console.log("home accept a msg,the slice count is:" + tmp_slice.mSliceCount);
                                // 成功接受到一条信息
                                HOME.sendMsg();
                                HOME.mPackSlices = [];
                            }
                            tmp_slice = new Slice();

                            dataPos += offset;
                            leftSize -= offset;
                            mPackState = REC_HEADER;
                        }

                    }
                }
            }


        })

    })
}


function initAlarmWS() {
    wss = new WebSocket.Server({port:CONST.PORT.WS_ALARM});
    console.log("WS(8085) is running ...");
    wss.on('connection', function connection(ws) {
        console.log('accept connection from' + ws.address);
        HOME.alarm_phone_ws.push(ws);
        ws.on('message', function incoming(data) {
            var jsonData = JSON.parse(data);
            console.log('message:' + data);
        });
        ws.on('close',function close(){
            console.log("a socket close");
            for(let i=0;i<HOME.alarm_phone_ws.length;i++){
                if(HOME.alarm_phone_ws[i]==ws){
                    HOME.alarm_phone_ws.splice(i,1);
                    break;
                }
            }
        })
    });
}






