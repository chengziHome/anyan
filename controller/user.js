const CONST = require('../utils/const');
var request = require('request');
var util = require('util');
var Home = require('../utils/user/home');



class User {


    index(req, res, next) {
        res.render('login', {err_msg: ''});
    }

    reset(req, res, next) {
        res.render('reset', {err_msg: '', change_success: ''});
    }


    login(req, res, next) {
        var type = req.body.type;
        var username = req.body.username;
        var password = req.body.password;
        var videosList = req.body.videosList;
        console.log("type:" + type + ",username:" + username + ",password:" + password + ",videlList:\n" + videosList);


        if (type == CONST.LOGIN.HOME) {

            CONST.HOME.username = username;
            CONST.HOME.videosList = JSON.parse(videosList);
            res.send('{"ret_code":0,"err_msg":""}')
        } else {
            res.render('video', {
                videos: CONST.HOME.videosList, alarms: CONST.HOME.alarmsList,
                video_id: '-1', username: username, uuid: -1
            })
        }


        //         cancel the login module


        //
        // request.post({
        //         url: 'http://localhost:8080/wechat/login/',
        //         form: {username: username, password: password, type: type}
        //     },
        //     function (err, response, body) {
        //
        //
        //
        //
        //         if(body=='success'){
        //             // 初始化home对象
        //             if(type==CONST.LOGIN.HOME){
        //                 HOME.username = username;
        //                 HOME.videosList = videosList;
        //
        //                 res.send('{"ret_code":0,"err_msg":""}')
        //             }else{
        //                 res.render('video',{videos:HOME.videosList,alarms:HOME.alarmsList,
        //                     video_id:'-1',username:username,uuid:-1})
        //             }
        //         }else{
        //             if(type==CONST.LOGIN.HOME){
        //                 res.send('{"ret_code":-1,"err_msg":"server wrong"}')
        //             }else{
        //                 res.render('error',{message:'login failed'})
        //             }
        //
        //         }
        //     })
    }


}


module.exports = User;






