

// tcp protocol

const TCP = {
    SLICE_LENGTH:1024,
    HEADER_LENGTH:26
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

const REGISTER = {
    HOME_LIST:[],
    VIDEO_STREAM_LIST:[]
}



exports.TCP = TCP;
exports.PORT = PORT;
exports.LOGIN = LOGIN;
exports.REGISTER = REGISTER;



