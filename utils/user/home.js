const CONST = require("../const");
var Alarm = require("../tcp/alarm");
var Message = require("../tcp/Message");
var fs = require("fs");
var path = require("path");

class Home{

    constructor(){
        this.username = '';
        this.videosList = [];//a video item is a json string.ie:{id:12,name:'院士楼1'}
        this.alarmsList = [];//how to process picture(jpg)
        this.video_ctrl_ws = null;//Video Ctrl ws reference,that's a WebSocket object reference.
        this.video_stream_ws = [];// Deprecated.See VideoStreamPair.
        this.alarm_home_tcp = null;//a tcp socket object reference
        this.alarm_phone_ws = [];

        //alarm message
        this.alarm_map = new Map();//key:alarm id,value:alarm object

        this.mPackState = CONST.TCP.REC_HEADER;
        this.mRecvBuffer = null;
        this.mPackSlices = [];



    }

    toString(){
        return JSON.stringify({
            username:this.username,
            videos:this.videoList.length
        })
    }

    /**
     * 从内部mPackSlices构建一个alarm,并从ws列表转发出去.
     * TODO:实际上这种方式特别不好,应该把构建Message的工作搞到外面去.
     *
     */
    sendMsg(){
        var msg = new Message();
        msg.init(this.mPackSlices);
        msg.build();
        var msg_xml = msg.getXml();

        //过滤重复登录信息
        if (msg_xml.Notify.$.Type == "Login"){
            console.log("重复登录");
            return;
        }

        //生成图片
        //TODO:如果没有图片怎么处理.
        var pictures = msg_xml.Notify.Alarming[0].Picture;
        var imgs = [];


        var pictures_data = msg.getPictures();

        for (let k = 0; k < pictures.length; k++) {
            var img_url = '/tmp/' + this.username + '/' + msg.mSn + '-' + k + '.jpg';
            fs.writeFileSync(path.join(__dirname,'../../public' + img_url), pictures_data[k], function (err) {
                if (err) {
                    console.log(err.message);
                }
                console.log('saved!');
            })
            imgs.push(img_url);
        }
        msg_xml.imgs = imgs;
        console.log("msg_xml");
        console.log(msg_xml);
        //TODO:暂时没有实际转发,而是打印出来,看解析是否成功.


        return;

    }



    /**
     * 利用phone端的ws链接转发这条alarm_msg
     * @param alarm_msg
     */
    transmitAlarm(alarm_msg){
        for(let i=0;i<this.alarm_phone_ws.length;i++){
            this.alarm_phone_ws[i].send(alarm_msg);
        }
    }


}

module.exports = Home;







