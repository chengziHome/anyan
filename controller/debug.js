const CONST = require('../utils/const');
var util = require('util');
var fs = require('fs');


class Debug{

    img(req,res,next){
        if(req.method=="GET"){
            console.log("Accept get ...");
            res.render('img',{
                img:null
            });
        }else if(req.method=="POST"){
            console.log("Accept post ...");

            fs.readFile('/home/chengzi/Pictures/x5.jpg','utf-8',function(err,data){
                console.log("img:"+data.length);
                res.render('img',{
                    img:data
                })
            })
        }else{
            console.log("else");
        }

    }

    ws(req,res,next){
        res.render('ws')
    }


    printHome(req,res,next){
        console.log(CONST.HOME.toString());
        res.send("print OK");
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


module.exports = Debug;









