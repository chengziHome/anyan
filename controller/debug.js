const CONST = require('../utils/const');



class Debug{

    print(req,res,next){
        res.send(getHomeList());
    }
}






function getHomeList(){
    var result = 'Homelist:\n';
    for (var i=0;i<CONST.REGISTER.HOME_LIST.length;i++){
        result += getHome(CONST.REGISTER.HOME_LIST[i]);
    }
    return result;
}

function getHome(home){
    return 'home[username:'+home.username+',video_ctrl_ws:'+home.video_ctrl_ws +']\n';

}











