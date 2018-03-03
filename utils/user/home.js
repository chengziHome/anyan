var Alarm = require("../tcp/alarm");
var Message = require("../tcp/Message");
var fs = require("fs");
var path = require("path");

const ALARM_TYPE=["闯入报警","陌生人报警","攀爬报警","遮挡报警"];

class Home{

    constructor(){
        this.username = '';
        this.videosList = ["服务器通道１","服务器通道2","服务器通道3","服务器通道4","服务器通道5","服务器通道6"];//a video item is a json string.ie:{id:12,name:'院士楼1'}
        this.alarmsList = [];//how to process picture(jpg)
        this.video_ctrl_ws = null;//Video Ctrl ws reference,that's a WebSocket object reference.
        this.video_stream_ws = [];// Deprecated.See VideoStreamPair.
        this.alarm_home_tcp = null;//a tcp socket object reference
        this.alarm_phone_ws = [];
        this.video_pair_list = [];

        //alarm message

        this.mPackState = 1;
        this.mRecvBuffer = null;
        this.mPackSlices = [];



    }

    toString(){


        return JSON.stringify({
            username:this.username,
            videos:this.videosList.length,
            video_pair_len:this.video_pair_list.length,
            alarm_home_tcp_null:this.alarm_home_tcp==null,
            alarm_phone_ws:this.alarm_phone_ws.length
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
        if (msg_xml.Notify.$.Type == "DrawBoundMessage"){
            console.log("AlarmBox ");
            return;
        }

        //生成图片
        //TODO:如果没有图片怎么处理.
        var pictures = msg_xml.Notify.Alarming[0].Picture;
        var imgs = [];


        var pictures_data = msg.getPictures();
        console.log("pic_data_0_size:"+pictures_data[0].length);


        for (let k = 0; k < pictures.length; k++) {
            var alarm_sn = msg.mSn%3;
            var img_url = '/tmp/' + alarm_sn + '-' + k + '.jpg';
            fs.writeFileSync(path.join(__dirname,'../../public' + img_url), pictures_data[k], function (err) {
                if (err) {
                    console.log(err.message);
                }
                console.log('saved!');
            })
            imgs.push(img_url);
        }
        msg_xml.Notify.Alarming[0].imgs = imgs;
        console.log("msg_xml");
        console.log(msg_xml);


        //构造转发对象
        var alarm = {};
        alarm.time = msg_xml.Notify.Alarming[0].$.stamp;
        alarm.type = ALARM_TYPE[parseInt(msg_xml.Notify.Alarming[0].$.type)];


        var video_id = parseInt(msg_xml.Notify.Alarming[0].$.channelID);
        var video_name = this.videosList[video_id-1].name;


        alarm.channel = video_name;
        alarm.imgs = msg_xml.Notify.Alarming[0].imgs;
        console.log(alarm);


        for(let i=0;i<this.alarm_phone_ws.length;i++){
            this.alarm_phone_ws[i].send(JSON.stringify(alarm));
        }


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







