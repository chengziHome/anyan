const CONST = require('../utils/const');
var request = require('request');
var util = require('util');
var Home = require('../utils/user/home');

const HOME_MAP = CONST.REGISTER.HOME_MAP;
const HOME_TCP_MAP = CONST.REGISTER.HOME_TCP_MAP;
const VIDEO_PAIR_MAP = CONST.REGISTER.VIDEO_PAIR_MAP;
const VIDEO_HOME_MAP =CONST.REGISTER.VIDEO_HOME_MAP;
const VIDEO_PHONE_MAP = CONST.REGISTER.VIDEO_PHONE_MAP;





class User{




    index(req,res,next){
        res.render('login', {err_msg: ''});
    }

    reset(req,res,next){
        res.render('reset', {err_msg: '', change_success: ''});
    }


    login(req,res,next){
        var type = req.body.type;
        var username = req.body.username;
        var password = req.body.password;
        var videosList = req.body.videosList;
        console.log("type:"+type +",username:" +username+",password:"+ password+",videlList:\n"+videosList);

        request.post({url:'http://localhost:8080/wechat/login/',
                form:{username:username,password:password,type:type}},
            function (err,response,body) {
                if(body=='success'){
                    // 初始化home对象
                    if(type==CONST.LOGIN.HOME){

                        var home = null;
                        if((home=(HOME_MAP.get(username)))==null){
                            console.log("login first time");
                            var home = new Home();
                            home.username = username;
                            home.videosList = videosList;
                            HOME_MAP.set(username,home);
                        }
                        home.videosList = videosList;
                        //遍历Map
                        res.send('{"ret_code":0,"err_msg":""}')
                    }else{
                        var home = null;
                        if((home=HOME_MAP.get(username))==null){
                            res.render('error',{message:'Your Home Server has not connected'})
                        }else{
                            res.render('video',{videos:JSON.parse(home.videosList),alarms:(home.alarmsList||[]),
                                video_id:'-1',username:username,uuid:-1})
                        }
                    }
                }else{
                    if(type==CONST.LOGIN.HOME){
                        res.send('{"ret_code":-1,"err_msg":"server wrong"}')
                    }else{
                        res.render('error',{message:'login failed'})
                    }

                }
            })
    }


}


module.exports = User;






