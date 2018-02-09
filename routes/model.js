// 定义要存储的数据类型
var express = require('express');
var router = express.Router();


/* A home Class */
function Home(){
    this.username = '';
    this.videoList = [];//a video item is a json string.ie:{id:12,name:'院士楼1'}
    this.alarmList = [];//how to process picture(jpg)
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
    this.home_ws = null;
    this.phone_ws = null;
    this.video_id = '';
    this.unique_no = '';

}
function createVideoStream(){
    return new VideoStream();
}




module.exports = router;

