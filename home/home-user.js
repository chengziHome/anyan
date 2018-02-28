var request = require('request');
var Slice = require('../utils/tcp/slice');
const CONST = require('../utils/const');


class HomeUser{


    login(req,res,next){
        request.post({
                url: 'http://localhost:80/users/login/',
                form: {
                    username: 'kaola',
                    password: 'kl123456',
                    type: 'HOME',
                    videosList: '[{"id":1,"name":"教学楼1号"},{"id":2,"name":"评学楼3号"}]'
                }
            },
            function (err, response, body) {
                console.log('body:' + body);
            });
        res.send("HomeUser Login successfully!");
    }
}


module.exports = HomeUser;

