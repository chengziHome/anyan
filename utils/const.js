

// tcp protocol

const TCP = {
    SLICE_LENGTH:1024,
    HEADER_LENGTH:26,
    NOTIFY_LOGIN:"Login",
    NOTIFY_ALARM:"Alarming",
    ALARM_TYPE:["闯入报警","陌生人报警","攀爬报警","遮挡报警"],
    LOGIN_SUCCESS:"<Notify Type=\"LoginResponse\">\n" +
    "                   <Code>0</Code>\n" +
    "                   <Message>Register Successfully!</Message>\n" +
    "               </Notify>",
    LOGIN_FAILED:"<Notify Type=\"LoginResponse\">\n" +
    "                   <Code>-1</Code>\n" +
    "                   <Message>Your home has not logined yet.</Message>\n" +
    "             </Notify>",


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

const REGISTER = {
    HOME_MAP:new Map(),
    HOME_TCP_MAP:new Map(),

    VIDEO_PAIR_MAP:new Map(),
    VIDEO_HOME_MAP:new Map(),
    VIDEO_PHONE_MAP:new Map(),

    //debug
    SOCKET_LIST: []
}



exports.TCP = TCP;
exports.PORT = PORT;
exports.LOGIN = LOGIN;
exports.REGISTER = REGISTER;



