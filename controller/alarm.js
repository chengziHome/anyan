var net = require('net');
var fs = require('fs');
var path = require('path');
var xml2js = require('xml2js');
const CONST = require('../utils/const');
var Slice = require('../utils/tcp/slice');
var Alarm = require('../utils/tcp/alarm');
var Home = require('../utils/user/home');
var HomeUtil = require('../utils/user/home-util');


const HOME_MAP = CONST.REGISTER.HOME_MAP;
const HOME_TCP_MAP = CONST.REGISTER.HOME_TCP_MAP;
const VIDEO_PAIR_MAP = CONST.REGISTER.VIDEO_PAIR_MAP;
const VIDEO_HOME_MAP = CONST.REGISTER.VIDEO_HOME_MAP;
const VIDEO_PHONE_MAP = CONST.REGISTER.VIDEO_PHONE_MAP;
const REC_HEADER = CONST.TCP.REC_HEADER;
const REC_DATA = CONST.TCP.REC_DATA;
const HEADER_LENGTH = CONST.TCP.HEADER_LENGTH;
const SOCKET_LIST = CONST.REGISTER.SOCKET_LIST;




const xmlParser = new xml2js.Parser();
const xmlBuilder = new xml2js.Builder();
var tcpServer = null;


var count = 0;

var log_count = 0;


class AlarmController {

    init(req, res, next) {
        if (tcpServer != null) {
            res.send("initilized already!");
        } else {
            tcpServer = net.createServer();
            tcpServer.listen(CONST.PORT.TCP_ALARM);
            console.log('TCP server is listening at port:' + CONST.PORT.TCP_ALARM);
            tcpServer.on('connection', function (sock) {

                sock.on('data', function (data) {
                    console.log("Accept data:" + count++ + ",len:" + data.length);
                    //判断是否初次链接.也即是否有home对象
                    var home = HOME_TCP_MAP.get(sock);
                    if (home == null) {//初次链接,其data必然是一个Slice
                        //todo:单用户，这部分是写死的
                        var home = new Home();
                        home.username = "kaola";
                        home.alarm_home_tcp = sock;
                        HOME_MAP.set("kaola",home);
                        HOME_TCP_MAP.set(sock,home);
                        console.log("Home TCP Login successfully!");
                        // var dataBuf = Buffer.from(data);
                        // var slice = new Slice();
                        // slice.init(dataBuf.slice(0,HEADER_LENGTH));
                        // var slice_data = dataBuf.slice(HEADER_LENGTH,dataBuf.length);
                        // xmlParser.parseString(slice_data, function (err, result) {
                        //     console.log("Excepted login xml:" + JSON.stringify(result));
                        //     if (result.Notify.$.Type == CONST.TCP.NOTIFY_LOGIN) {
                        //         console.log("Login Type");
                        //         var username = result.Notify.Username[0];
                        //         var tcp_home;
                        //         if ((tcp_home = HOME_MAP.get(username)) == null) {
                        //             sock.write(CONST.TCP.LOGIN_FAILED);
                        //         } else {
                        //             //简单起见，每次登录直接覆盖。
                        //             tcp_home.alarm_home_tcp = sock;
                        //             HOME_TCP_MAP.set(sock, tcp_home);
                        //             //登录时即创建用户的图片临时存储目录
                        //             if (!fs.existsSync(path.join(__dirname, '../public/tmp/' + username))) {
                        //                 fs.mkdirSync(path.join(__dirname, '../public/tmp/' + username));
                        //             }
                        //             sock.write(CONST.TCP.LOGIN_SUCCESS);
                        //         }
                        //     } else {
                        //         console.log("No Login Type");
                        //
                        //         //do nothing,初次连接只接受login信息
                        //     }
                        // })
                    } else {//配合home里面的数据继续接受
                        var mPackState = home.mPackState;
                        var mPackSlices = home.mPackSlices;
                        var mRecvBuf = home.mRecvBuffer;

                        var dataBuff = data;
                        var dataSize = data.length;

                        //解析slice.
                        if (mRecvBuf != null) {
                            dataSize += mRecvBuf.length;
                            dataBuff = Buffer.from(mRecvBuf, dataBuff);

                            home.mRecvBuffer = null;
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
                                            home.mRecvBuffer = Buffer.from(dataBuff.slice(dataPos));
                                        }else{
                                            home.mRecvBuffer = null;
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
                                case REC_DATA:{
                                    if(leftSize<tmp_slice.mSliceLength){
                                        if(leftSize<tmp_slice.mSliceLength){
                                            home.mRecvBuffer = Buffer.from(dataBuff.slice(dataPos));
                                        }else{
                                            home.mRecvBuffer = null;
                                        }
                                        isEnough = false;
                                    }else{
                                        var offset = tmp_slice.mSliceLength;
                                        tmp_slice.setmData(Buffer.from(dataBuff.slice(dataPos,dataPos+offset)));
                                        home.mPackSlices.push(tmp_slice);
                                        if(tmp_slice.mSliceCount-1 == tmp_slice.mSliceSn){
                                            console.log("home accept a msg,the slice count is:"+tmp_slice.mSliceCount);
                                            // 成功接受到一条信息
                                            home.sendMsg();
                                            home.mPackSlices = [];
                                        }
                                        tmp_slice = new Slice();

                                        dataPos += offset;
                                        leftSize -= offset;
                                        mPackState = REC_HEADER;
                                    }

                                }
                            }
                        }


                    }


                    // var slice = new Slice();
                    // slice.init(data);
                    // // console.log("Accept slice:" + slice.getmSliceSn());
                    // //得到home对象
                    // var home = CONST.REGISTER.HOME_TCP_MAP[sock];
                    // if (home == null) {//tcp初次链接
                    //     if (slice.mSliceCount != 1) {
                    //         //初次login的xml必是一个包
                    //     } else {
                    //         xmlParser.parseString(slice.mData, function (err, result) {
                    //             console.log("Excepted login xml:" + JSON.stringify(result));
                    //             if (result.Notify.$.Type == CONST.TCP.NOTIFY_LOGIN) {
                    //                 console.log("Login Type");
                    //                 var username = result.Notify.Username[0];
                    //                 var home;
                    //                 if ((home = HOME_MAP.get(username)) == null) {
                    //                     sock.write(CONST.TCP.LOGIN_FAILED);
                    //                 } else {
                    //                     //简单起见，每次登录直接覆盖。
                    //                     home.alarm_home_tcp = sock;
                    //                     CONST.REGISTER.HOME_TCP_MAP.set(sock, home);
                    //                     //在public下创建图片的存储目录。
                    //                     sock.write(CONST.TCP.LOGIN_SUCCESS);
                    //                 }
                    //             } else {
                    //                 console.log("No Login Type");
                    //
                    //                 //do nothing,初次连接只接受login信息
                    //             }
                    //         })
                    //     }
                    // } else {
                    //     //只有报警信息
                    //     let alarm = null;
                    //     if ((alarm = home.alarm_map.get(slice.mSn)) != null) {
                    //         if (alarm.slices.length == slice.mSliceSn) {//按序到达
                    //             alarm.addSlice(slice);
                    //             if (alarm.slices.length == slice.mSliceCount) {//所有包都到了
                    //                 //todo: 完成这三个最核心的方法
                    //                 alarm.buildAlarm();
                    //                 var alarm_data = alarm.getMsg();
                    //                 //生成图片.
                    //                 var pictures_base64 = alarm.getPictures();
                    //                 var username = home.username;
                    //                 var imgs = [];
                    //
                    //                 if (!fs.existsSync(path.join(__dirname, '../public/tmp/' + username))) {
                    //                     fs.mkdirSync(path.join(__dirname, '../public/tmp/' + username));
                    //                 }
                    //
                    //                 for (let k = 0; k < pictures_base64.length; k++) {
                    //                     img_url = '/tmp/' + username + '/' + alarm.mSn + '-' + k + '.jpg';
                    //                     fs.writeFileSync('../public' + img_url, data, 'base64', function (err) {
                    //                         if (err) {
                    //                             console.log(err.message);
                    //                         }
                    //                         console.log('saved!');
                    //                     })
                    //                     imgs.push(img_url);
                    //                 }
                    //                 alarm_data.imgs = imgs;
                    //                 console.log("alarm_data:" + alarm_data);
                    //                 home.transmitAlarm(JSON.stringify(alarm_data));
                    //             } else {
                    //                 // do nothing
                    //             }
                    //         } else {
                    //             home.alarm_map.delete(slice.mSn);
                    //             console.log(slice.mSn + "号报警在count=" + slice.mSliceSn + "处未按需到达，故抛弃");
                    //         }
                    //
                    //     } else if (slice.mSliceSn == 0) {//第一块
                    //         var new_alarm = new Alarm();
                    //         home.alarm_map.set(slice.mSn, new_alarm);
                    //         new_alarm.init(slice);
                    //         if (slice.mSliceCount == 1) {//应该几乎不会执行到
                    //             //todo:未copy，一般不会执行到
                    //             new_alarm.buildAlarm();
                    //             var alarm_data = new_alarm.getMsg();
                    //             home.transmitAlarm(alarm_data);
                    //         }
                    //
                    //     } else {//非第一块，是前面序列因未按序到达已经被抛弃
                    //         //do nothing，直接丢弃
                    //     }
                    //
                    //
                    // }

                })

            })
        }
        res.send("InitServer successfully!");

    }



    initAlarmWS(req,res,next){
        var wss = new WebSocket.Server({port:CONST.PORT.WS_ALARM});
        console.log("WS(8081) is running ...");
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


    //单用户，目前不需要．
    subscribe(req,res,next){
        var username = req.body.username;
        var home = HOME_MAP.get(username);
        if(home!=null){
            var tcp_sock = home.alarm_home_tcp;
            tcp_sock.write(Buffer.from('<Subscribe Type="Alarming"><ChannelId>*</ChannelId></Subscribe>'))
        }else{
            console.log("user:"+username+",home not exist");
        }
    }


}


module.exports = AlarmController;







