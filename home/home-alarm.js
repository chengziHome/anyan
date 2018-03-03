const CONST = require('../utils/const');
var net = require('net');
var Slice = require('../utils/tcp/slice');
var fs = require('fs');
var path = require('path');



LOCAL_HOST = 'localhost';
SERVER_HOST = '47.97.181.47';



var client;

class HomeAlarm {
    /**
     * 构建一个登录的slicet
     */

    init(req,res,next){
        console.log("Client begin to init...");
        if(client == null){
            client = net.createConnection({port:8084,host:LOCAL_HOST},function(){
                console.log("Connection has been created");
                res.send("InitClient successfully!");
            })
            client.on("data",function(data){
                console.log("accept data:"+data);
            })
        }else{
            res.send("The Client has been initilized!");
        }
    }


    alarm(req,res,next) {

        var pic_num = 5;

        var imgs = Array(pic_num+1);
        var alarm_xml_pic = '';

        for (var i = 1; i <= pic_num; i++) {

            var data = fs.readFileSync(path.join(__dirname, '../public/wechat/img/x' + (i+1) + '.jpg'));
            imgs[i] = data;
            // console.log("type:"+Object.prototype.toString.call(imgs[i]));
            alarm_xml_pic += '<Picture length="' + data.length + '" ></Picture>'
        }


        var alarm_xml = '<Notify Type="Alarming"><Alarming channelID="4" opt="subscribe" stamp="2018-02-09 12:12:13" type="0">'
            + alarm_xml_pic + '</Alarming></Notify>';

        var alarm_xml_buf = Buffer.from(alarm_xml);
        imgs[0] = alarm_xml_buf;
        var alarm = Buffer.concat(imgs);




        var sn = 1;
        var length = alarm.length;
        var msgLength = imgs[0].length;
        var SLICE_MAX_LENGTH = CONST.TCP.SLICE_LENGTH - CONST.TCP.HEADER_LENGTH;
        var sliceCount = Math.ceil(length / SLICE_MAX_LENGTH);

        var slices = new Array(sliceCount);
        for (var i = 0; i < sliceCount - 1; i++) {
            var slice = new Slice();
            slice.setmVer(0x01);
            slice.setmSn(sn);
            slice.setmSliceCount(sliceCount);
            slice.setmSliceSn(i);
            slice.setmSliceLength(SLICE_MAX_LENGTH);
            slice.setmLength(length);
            slice.setmMsgLength(msgLength);
            slice.setmData(alarm.slice(i * SLICE_MAX_LENGTH, (i + 1) * SLICE_MAX_LENGTH));

            slices[i] = slice.getBuffer();
        }

        //处理最后一片
        var slice = new Slice();
        slice.setmVer(0x01);
        slice.setmSn(sn);
        slice.setmSliceCount(sliceCount);
        slice.setmSliceSn(sliceCount - 1);
        slice.setmSliceLength(length % SLICE_MAX_LENGTH);
        slice.setmLength(length);
        slice.setmMsgLength(msgLength);
        slice.setmData(alarm.slice((sliceCount - 1) * SLICE_MAX_LENGTH, length));
        slices[sliceCount - 1] = slice.getBuffer();




        for(let k=0;k<sliceCount;k++){
                client.write(slices[k]);
        }

        res.send("TCP Alarm send ok!");

    }



}







module.exports = HomeAlarm;





































