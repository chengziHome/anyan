const CONST = require('../utils/const');
var net = require('net');
var Slice = require('../utils/tcp/slice');
var fs = require('fs');
var path = require('path');

HOST = 'localhost';

var client;

class HomeAlarm {
    /**
     * 构建一个登录的slice
     */

    init(req,res,next){
        if(client == null){
            client = net.createConnection({port:8084,host:HOST,localPort:9000},function(){
                console.log("Connection has been created");
                res.send("InitClient successfully!");
            })
        }else{
            res.send("The Client has been initilized!");
        }
    }


    login(req,res,next) {
        var login_xml = '<Notify Type="Login"><Username>kaola</Username></Notify>';
        var slice = new Slice();
        slice.setmVer(0x01);
        slice.setmSn(0x0001);
        slice.setmSliceCount(0x0001);
        slice.setmSliceSn(0x0000);
        var msg = Buffer.from(login_xml);
        slice.setmSliceLength(msg.length);
        slice.setmLength(msg.length);
        slice.setmMsgLength(msg.length);
        slice.setmData(Buffer.from(login_xml));

        var buf = slice.getBuffer();

        console.log("login buf:");
        console.log(buf);
        client.write(buf);

        res.send("TCP login OK");

    }


    alarm(req,res,next) {

        var pic_num = 7;

        var imgs = Array(pic_num+1);
        var alarm_xml_pic = '';

        for (var i = 1; i <= pic_num; i++) {

            var data = fs.readFileSync(path.join(__dirname, '../public/wechat/img/x' + i + '.jpg'));
            imgs[i] = data;
            console.log("before send,picture.len:"+data.length);
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





































