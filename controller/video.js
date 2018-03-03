const CONST = require('../utils/const');
const uuid = require('node-uuid');
var WebSocket = require('ws');
var VideoStreamPair = require('../utils/user/video-stream-pair');


var videoCtrlServer = null;
var videoStreamHome = null;
var videoStreamPhone = null;

class Video {

    constructor(){

    }

    async play(req, res, next) {
        var username = req.body.username;
        var video_id = req.body.video_id;
        var width = req.body.width;
        var height = req.body.height;
        console.log("username:" + username + ",video_id:" + video_id + ",width:" + width + ",height:" + height);

        var pair = new VideoStreamPair();
        pair.uuid = uuid.v1();
        pair.username = username;
        pair.width = width;
        pair.height = height;
        pair.video_id = parseInt(video_id);
        CONST.HOME.video_pair_list.push(pair);


        CONST.HOME.video_ctrl_ws.send(JSON.stringify({
                video_id: parseInt(video_id),
                uuid: pair.uuid,
                width: pair.width,
                height: pair.height
            }), function () {
                console.log("send already,uuid");
                res.send({ret_code: 0, err_msg: "ok", uuid: pair.uuid});
            }
        );

    }


    initWS(req, res, next) {
        /*　 init the ws server and tcp server */
        if(videoCtrlServer==null){
            initCtrlWS();
        }
        if(videoStreamHome==null){
            initStreamWSHome()
        }
        if(videoStreamPhone==null){
            initStreamWSPhone();
        }
        res.send("init Video WS server ok!");
    }


}


/**
 * WebSocket
 */


/**
 * video ctrl WS Server ,port:8081
 * this server will not accept something,but send the video_id
 */
function initCtrlWS() {
    videoCtrlServer = new WebSocket.Server({port: CONST.PORT.WS_CTRL_HOME});
    console.log("WS(8081) is running ...")
    videoCtrlServer.on('connection', function connection(ws) {
        console.log('8081 accept connection from home(ctrl):');
        CONST.HOME.video_ctrl_ws = ws;
        ws.on('message', function incoming(data) {
            var jsonData = JSON.parse(data);
            console.log('message:' + jsonData);
        });
    });
}

/**
 * video stream home WS Server ,port:8082
 * There is two steps;
 * one:accept the video identify:{video_id:2,unique_id:12},return:{ret_code:0,err_msg:'something wrong'}
 * two:accept the video stream.
 */

function initStreamWSHome() {
    videoStreamHome = new WebSocket.Server({port: CONST.PORT.WS_STREAM_HOME});
    console.log("WS(8082) is running ...")

    videoStreamHome.on('connection', function connection(ws) {
        console.log('8082 accept connection from home:');
        ws.on('message', function incoming(data) {
            var pair = null;
            if ((pair = getPairByHome(ws)) != null) {//ts　stream
                if (pair.phone_ws != null) {//用户已经就绪
                    pair.phone_ws.send(data);

                }else{//用户已经关闭链接
                    console.log("there is no phone ws");
                }
            } else {//初次链接
                console.log("8082 first receive data from home:" + data);
                var jsonData = JSON.parse(data);

                var stream_pair = getPairByUUID(jsonData.uuid);
                if (stream_pair != null) {
                    stream_pair.home_ws = ws;
                    if (stream_pair.phone_ws != null) {
                        ws.send(JSON.stringify({ret_code: 0, err_msg: "Please send the ts stream"}));
                    }

                } else {
                    ws.send(JSON.stringify({
                        ret_code: -2,
                        err_msg: "The phone's request has been canceled!You should not retry this connection"
                    }))
                }

            }
        });
    });
}


/**
 * video stream phone WS Server,port:8083
 *
 */
function initStreamWSPhone() {
    videoStreamPhone = new WebSocket.Server({port: CONST.PORT.WS_STREAM_PHONE});
    console.log("WS(8083) is running ...")

    videoStreamPhone.on('connection', function connection(ws) {
        console.log('8083 accept connection from phone:');
        ws.on('message', function incoming(data) {
            console.log("8083 receive data from phone:" + data);

            //only accept a message once
            var jsonData = JSON.parse(data);

            var stream_pair = getPairByUUID(jsonData.uuid);
            if (stream_pair != null) {
                stream_pair.phone_ws = ws;
                if (stream_pair.home_ws != null) {
                    stream_pair.home_ws.send(JSON.stringify({
                        ret_code: 0,
                        err_msg: "Please send the ts stream"
                    }))
                }

            } else {
                ws.send(JSON.stringify({
                    ret_code: -2,
                    err_msg: "Can't find the pair"
                }));
            }
        });
        ws.on('close', function close() {
            //立即关闭home的socket链接．
            console.log("8083 close the home ws");
            removePairByPhone(ws);
        })
    });
}





function getPairByHome(ws){
    for(let i=0;i<CONST.HOME.video_pair_list.length;i++){
        if(CONST.HOME.video_pair_list[i].home_ws==ws){
            return CONST.HOME.video_pair_list[i];
        }
    }
    return null;
}


function getPairByUUID(uuid){
    for(let i=0;i<CONST.HOME.video_pair_list.length;i++){
        if(CONST.HOME.video_pair_list[i].uuid==uuid){
            return CONST.HOME.video_pair_list[i];
        }
    }
    return null;
}


function removePairByHome(){
    for(let i=0;i<CONST.HOME.video_pair_list.length;i++){
        if(CONST.HOME.video_pair_list[i].home_ws==ws){
            CONST.HOME.video_pair_list.splice(i,1);
            break;
        }
    }
}


function removePhoneByPhone(ws){
    for(let i=0;i<CONST.HOME.video_pair_list.length;i++){
        if(CONST.HOME.video_pair_list[i].phone_ws==ws){
            CONST.HOME.video_pair_list.phone_ws=null;
            break;
        }
    }
}

function removePairByPhone(ws){
    var tmp_home = null;
    for(let i=0;i<CONST.HOME.video_pair_list.length;i++){
        if(CONST.HOME.video_pair_list[i].phone_ws==ws){
            if(CONST.HOME.video_pair_list[i].home_ws!=null){
                CONST.HOME.video_pair_list[i].home_ws.close();
                tmp_home = CONST.HOME.video_pair_list[i].home_ws;
                console.log("8083 close successfully")
            }

            //上一个链接的数据可能在网络中有残留，所以要延迟删除这个pair
            setTimeout(function(){
                removePairByHome(tmp_home);
            },60000);
            break;
        }
    }
}


module.exports = Video;
