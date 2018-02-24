

const CONST = require('../utils/const');
const uuid = require('node-uuid');



class Video{

    async play(req,res,next){
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

    }


    initWS(req,res,next){
        /* init the ws server and tcp server */
        console.log("intilizing WS Server");
        initVideoCtrlWS();
        initVideoStreamWS();
        res.send("init ok");
    }


}


/**
 * WebSocket
 */


/**
 * video ctrl WS Server ,port:8081
 * this server will not accept something,but send the video_id
 */
function initVideoCtrlWS(){
    var wss = new WebSocket.Server({port:CONST.PORT.WS_CTRL});
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
    var wss = new WebSocket.Server({port:CONST.PORT.WS_STREAM});
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
                    if(jsonData.type==CONST.LOGIN.HOME){

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





