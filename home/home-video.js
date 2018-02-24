var request = require('request');
var Slice = require('../utils/tcp/slice');
const CONST = require('../utils/const');



// request.post({url:'http://localhost:80/login/',
//         form:{username:'kaola',password:'kl123456',type:'HOME',videosList:'[{"id":1,"name":"教学楼1号"},{"id":2,"name":"评学楼3号"}]'}},
//     function (err,response,body) {
//         console.log('body:'+body);
//     });

// const uuid = require('node-uuid');
// var u = uuid.v1();
//
// console.log(JSON.stringify({uuid:u}));

var slice = new Slice();
// console.log(slice.mVer);
// slice.mVer(2);
// console.log(slice.mVer);
slice.setmVer(3);
console.log('test:'+slice.getmVer());

console.log(CONST.SLICE_LENGTH);

