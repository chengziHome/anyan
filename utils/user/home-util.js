

const HOME_LIST = require('../const').REGISTER.HOME_LIST;
const VIDEO_STREAM_LIST = require('../const').REGISTER.VIDEO_STREAM_LIST;


function getHomeByUsername(username){
    for (var i=0;i<HOME_LIST.length;i++){
        if(HOME_LIST[i].username == username){
            return HOME_LIST[i];
        }
    }
    return null;
}

function hasVideoStreamPhoneWS(websocket){
    for(var i=0;i<VIDEO_STREAM_LIST.length;i++){
        if(VIDEO_STREAM_LIST[i].phone_ws == websocket)
            return true;
    }
    return false;
}

function hasVideoStreamHomeWS(websocket){
    for(var i=0;i<VIDEO_STREAM_LIST.length;i++){
        if(VIDEO_STREAM_LIST[i].home_ws == websocket)
            return true;
    }
    return false;
}

function getPairByHome(home_ws){
    for(var i=0;i<VIDEO_STREAM_LIST.length;i++){
        if(VIDEO_STREAM_LIST[i].home_ws == home_ws)
            return VIDEO_STREAM_LIST[i];
    }
    return null;
}

function getPairByPhone(phone_ws){
    for(var i=0;i<VIDEO_STREAM_LIST.length;i++){
        if(VIDEO_STREAM_LIST[i].phone_ws == phone_ws)
            return VIDEO_STREAM_LIST[i];
    }
    return null;
}

function getPairByUUID(uuid){
    for(var i=0;i<VIDEO_STREAM_LIST.length;i++){
        if(VIDEO_STREAM_LIST[i].uuid == uuid)
            return VIDEO_STREAM_LIST[i];
    }
    return null;
}

function removePair(pair){
    for(var i=0;i<VIDEO_STREAM_LIST.length;i++){
        if (VIDEO_STREAM_LIST[i]==pair){
            VIDEO_STREAM_LIST.splice(i,1);
        }
    }
}


















