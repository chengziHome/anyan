var express = require('express');
var http = require('http');
var querystring = require('querystring');
var request = require('request');


var router = express.Router();
const LOGIN_TYPE_PHONE = 'PHONE';
const LOGIN_TYPE_HOME = 'HOME';


const WebSocket = require('ws');
const uuid = require('node-uuid');


const VIDEO_STREAM_PORT = 8082;
const VIDEO_CTRL_PORT = 8081;
const ALARM_TCP = 8084;
const ALARM_WS = 8085;

const TYPE_WS = 'WS';
const TYPE_TCP = 'TCP';

const HOME_LIST = [];
const VIDEO_STREAM_LIST = [];

// const HOME_CTRL_LIST = [];




router.get('/print',function(req,res,next){
    printHomeList();
    res.send('print success');
})

router.get('/ws',function(req,res,next){
    res.render('ws');
})



router.get('/init',function(req,res,next){
    /* init the ws server and tcp server */
    console.log("running here");
    initVideoCtrlWS();
    initVideoStreamWS();
    res.send("init ok");
});




/* get login page */
router.get('/', function (req, res, next) {
    res.render('login', {err_msg: ''});
});


router.get('/reset', function (req, res, next) {
    res.render('reset', {err_msg: '', change_success: ''});
});


// login
router.post('/login', function (req, res) {
    type = req.body.type;
    username = req.body.username;
    password = req.body.password;
    videosList = req.body.videosList;
    console.log("type:"+type +",username:" +username+",password:"+ password+",videlList:\n"+videosList);

    request.post({url:'http://localhost:8080/wechat/login/',
            form:{username:username,password:password,type:type}},
        function (err,response,body) {
            if(body=='success'){
                // 初始化home对象
                if(type==LOGIN_TYPE_HOME){

                    var home = null;
                    if((home=getHomeByUsername(username))==null){
                        var home = new Home();
                        home.username = username;
                        home.videosList = videosList;
                        HOME_LIST.push(home);
                    }
                    home.videosList = videosList;
                    res.send('{"ret_code":0,"err_msg":""}')
                }else{
                    var home = null;
                    if((home=getHomeByUsername(username))==null){
                        res.render('error',{message:'Your Home Server has not connected'})
                    }else{
                        res.render('video',{videos:JSON.parse(home.videosList),alarms:(home.alarmsList||[]),
                            video_id:'-1',username:username,uuid:-1})
                    }
                }
            }else{
                if(type==LOGIN_TYPE_HOME){
                    res.send('{"ret_code":-1,"err_msg":"server wrong"}')
                }else{
                    res.render('error',{message:'login failed'})
                }

            }
        })
});

router.post('/play', function (req,res) {
    var username = req.body.username;
    var video_id = req.body.video_id;
    var width = req.body.width;
    var height = req.body.height;
    console.log("username:"+username+",video_id:"+video_id+",width:"+width+",height:"+height);

    var pair = new VideoStream();
    pair.uuid = uuid.v1();
    pair.username = username;
    pair.width = width;
    pair.height = height;
    pair.video_id = parseInt(video_id);
    VIDEO_STREAM_LIST.push(pair);

    var home = getHomeByUsername(username);
    if (home!=null){
        var video_ctrl_ws = home.video_ctrl_ws;
        video_ctrl_ws.send(JSON.stringify({video_id:parseInt(video_id),uuid:pair.uuid,width:pair.width,height:pair.height}));

        res.send({ret_code:0,err_msg:"ok",uuid:pair.uuid});
    }else{
        res.send({ret_code:-1,err_msg:"Can not find your home ws connection"});
    }



})






/**
 * WebSocket
 */


/**
 * video ctrl WS Server ,port:8081
 * this server will not accept something,but send the video_id
 */
function initVideoCtrlWS(){
    var wss = new WebSocket.Server({port:VIDEO_CTRL_PORT});
    console.log("WS(8081) is running ...")
    wss.on('connection',function connection(ws){
        console.log('accept connection from'+ws.address);
        ws.on('message',function incoming(data){
            var jsonData = JSON.parse(data);
            console.log('message:'+data);
            var home = getHomeByUsername(jsonData.username);
            if(home.video_ctrl_ws==null){ //first visit
                home.video_ctrl_ws=ws;
            }else{
                //nothing,only accept connection here
            }

        });
    });
}

/**
 * video stream WS Server ,port:8082
 * There is two steps;
 * one:accept the video identify:{video_id:2,unique_id:12},return:{ret_code:0,err_msg:'something wrong'}
 * two:accept the video stream.
 */

function initVideoStreamWS(){
    var count = 0;
    var wss = new WebSocket.Server({port:VIDEO_STREAM_PORT});
    console.log("WS(8082) is running ...")

    wss.on('connection',function connection(ws){
        console.log('accept connection from'+ws.address);
        ws.on('message',function incoming(data){
            // 1,Is the websocket is a ts stream ws connection
            var pair = null;
            if((pair=getPairByHome(ws))!=null){
                console.log("视屏Stream:"+count++);
                pair.phone_ws.send(data);
            }else{
                // 2,It is a message connection
                console.log("receive data from phone:"+data);
                jsonData = JSON.parse(data);

                var stream_pair = getPairByUUID(jsonData.uuid);
                if(stream_pair != null){
                    if(jsonData.type==LOGIN_TYPE_PHONE){

                        stream_pair.phone_ws = ws;
                        if(stream_pair.home_ws!=null){
                            stream_pair.home_ws.send(JSON.stringify({ret_code:0,err_msg:"Please send the ts stream"}))
                        }

                        //if phone close the connection,the delete the pair
                        ws.on('close',function close(){
                            if(stream_pair.home_ws!=null){
                                stream_pair.home_ws.close();
                            }
                            removePair(stream_pair);
                        })

                    }else{
                        stream_pair.home_ws = ws;
                        if(stream_pair.phone_ws!=null){
                            ws.send(JSON.stringify({ret_code:0,err_msg:"Please send the ts stream"}));
                        }
                    }
                }else{
                    ws.send(JSON.stringify({ret_code:-2,err_msg:"The phone's request has been canceled!You should not retry this connection"}))
                }

            }
        });
    });
}



/**
 * utils
 */
/* A home Class */
function Home(){
    this.username = '';
    this.videosList = [];//a video item is a json string.ie:{id:12,name:'院士楼1'}
    this.alarmsList = [];//how to process picture(jpg)
    this.video_ctrl_ws = null;//Video Ctrl ws reference,that's a WebSocket object reference.
    this.video_stream_ws = [];
    this.alarm_home_tcp = null;//a tcp socket object reference
    this.alarm_phone_ws = [];
}

function createHome(){
    return new Home();
}


/* a video_stream pair*/
function VideoStream(){
    this.username = '';
    this.home_ws = null;
    this.phone_ws = null;
    this.video_id = '';
    this.uuid = '';
    this.width = 0;
    this.height = 0;

}
function createVideoStream(){
    return new VideoStream();
}


/**
 * utils
 */

function hasHome(username){
    for (var i=0;i<HOME_LIST.length;i++){
        if(HOME_LIST[i].username == username){
            return true;
        }
    }
    return false;
}

function getHomeByUsername(username){
    for (var i=0;i<HOME_LIST.length;i++){
        if(HOME_LIST[i].username == username){
            return HOME_LIST[i];
        }
    }
    return null;
}

function hasVideoStreamPhoneWS(websocket){
    for(var i=0;i<VIDEO_STREAM_LIST.length;i++){
        if(VIDEO_STREAM_LIST[i].phone_ws == websocket)
            return true;
    }
    return false;
}

function hasVideoStreamHomeWS(websocket){
    for(var i=0;i<VIDEO_STREAM_LIST.length;i++){
        if(VIDEO_STREAM_LIST[i].home_ws == websocket)
            return true;
    }
    return false;
}

function getPairByHome(home_ws){
    for(var i=0;i<VIDEO_STREAM_LIST.length;i++){
        if(VIDEO_STREAM_LIST[i].home_ws == home_ws)
            return VIDEO_STREAM_LIST[i];
    }
    return null;
}

function getPairByPhone(phone_ws){
    for(var i=0;i<VIDEO_STREAM_LIST.length;i++){
        if(VIDEO_STREAM_LIST[i].phone_ws == phone_ws)
            return VIDEO_STREAM_LIST[i];
    }
    return null;
}

function getPairByUUID(uuid){
    for(var i=0;i<VIDEO_STREAM_LIST.length;i++){
        if(VIDEO_STREAM_LIST[i].uuid == uuid)
            return VIDEO_STREAM_LIST[i];
    }
    return null;
}

function removePair(pair){
    for(var i=0;i<VIDEO_STREAM_LIST.length;i++){
        if (VIDEO_STREAM_LIST[i]==pair){
            VIDEO_STREAM_LIST.splice(i,1);
        }
    }
}


function Home(){
    this.username = '';
    this.videosList = [];//a video item is a json string.ie:{id:12,name:'院士楼1'}
    this.alarmList = [];//how to process picture(jpg)
    this.video_ctrl_ws = null;//Video Ctrl ws reference,that's a WebSocket object reference.
    this.video_stream_ws = [];
    this.alarm_home_tcp = null;//a tcp socket object reference
    this.alarm_phone_ws = [];
}

function printHomeList(){
    console.log('HOME_LIST:\n');
    for (var i=0;i<HOME_LIST.length;i++){
        printHome(HOME_LIST[i]);
    }
}


function Home(){
    this.username = '';
    this.videosList = [];//a video item is a json string.ie:{id:12,name:'院士楼1'}
    this.alarmsList = [];//how to process picture(jpg)
    this.video_ctrl_ws = null;//Video Ctrl ws reference,that's a WebSocket object reference.
    this.video_stream_ws = [];
    this.alarm_home_tcp = null;//a tcp socket object reference
    this.alarm_phone_ws = [];
}


function printHome(home){
    console.log('home[username:'+home.username+',video_ctrl_ws:'+home.video_ctrl_ws +']\n')
}









module.exports = router;
