const CONST = require('../utils/const');






class User{


    index(req,res,next){
        res.render('login', {err_msg: ''});
    }

    reset(req,res,next){
        res.render('reset', {err_msg: '', change_success: ''});
    }


    async login(req,res,next){
        type = req.body.type;
        username = req.body.username;
        password = req.body.password;
        videosList = req.body.videosList;
        console.log("type:"+type +",username:" +username+",password:"+ password+",videlList:\n"+videosList);

        request.post({url:'http://localhost:8080/wechat/login/',
                form:{username:username,password:password,type:type}},
            function (err,response,body) {
                if(body=='success'){
                    // 初始化home对象
                    if(type==CONST.LOGIN.HOME){

                        var home = null;
                        if((home=getHomeByUsername(username))==null){
                            var home = new Home();
                            home.username = username;
                            home.videosList = videosList;
                            CONST.REGISTER.HOME_LIST.push(home);
                        }
                        home.videosList = videosList;
                        res.send('{"ret_code":0,"err_msg":""}')
                    }else{
                        var home = null;
                        if((home=getHomeByUsername(username))==null){
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









