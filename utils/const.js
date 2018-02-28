var Home = require('./user/home');

// tcp protocol

const TCP = {
    SLICE_LENGTH:1024,
    HEADER_LENGTH:26,
    NOTIFY_LOGIN:"Login",
    NOTIFY_ALARM:"Alarming",
    ALARM_TYPE:["闯入报警","陌生人报警","攀爬报警","遮挡报警"],

    REC_HEADER:1,
    REC_DATA:2,

}

const PORT = {
    WEB:80,
    WS_CTRL:8081,
    WS_STREAM:8082,
    TCP_ALARM:8084,
    WS_ALARM:8085
}

const LOGIN = {
    HOME:"HOME",
    PHONE:"PHONE"
}


/**
 *
 * @type {{
 * HOME_MAP: key:username,value:home object
 * HOME_TCP_MAP: key:tcp socket,value:home object
 * VIDEO_PAIR_MAP: key:uuid,value:pair object
 * VIDEO_HOME_MAP: key:home_ws socket,value:pair object
 * VIDEO_PHONE_MAP: key:phone_ws socket,value:pair object
 *
 * 他们实际上有双向引用，如果要删除pair要把另外两个映射也删除
 *
 */


const HOME = new Home();



exports.TCP = TCP;
exports.PORT = PORT;
exports.LOGIN = LOGIN;
exports.HOME = HOME;



