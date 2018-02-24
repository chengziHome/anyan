

class Home{

    constructor(){
        this.username = '';
        this.videosList = [];//a video item is a json string.ie:{id:12,name:'院士楼1'}
        this.alarmsList = [];//how to process picture(jpg)
        this.video_ctrl_ws = null;//Video Ctrl ws reference,that's a WebSocket object reference.
        this.video_stream_ws = [];
        this.alarm_home_tcp = null;//a tcp socket object reference
        this.alarm_phone_ws = [];
    }
}








