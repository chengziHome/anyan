var fs = require('fs');
var path = require('path');



// fs.open('../public/wechat/img/x5.jpg','r+',function(err,fd){
//     fs.read(fd,Buffer.alloc(10240),0,1000,null,function(err,bytesRead,buffer){
//         console.log("bytesRead:"+bytesRead);
//         console.log("buffer:"+buffer);
//     })
//
// })

// var pics = [];
//
// for(var i=1;i<=3;i++){
//     console.log('i:'+i);
//
//     var data = fs.readFileSync(path.join(__dirname,'../public/wechat/img/x'+ i +'.jpg'));
//
//     console.log("type:"+Object.prototype.toString.call(data));
//     pics.push(data);
//
// }
//
//
// console.log("pic.len:"+pics.length);




fs.readFile(path.join(__dirname,'../public/wechat/img/x'+ 1 +'.jpg'),function(err,data){
    console.log("size:"+data.length);
    console.log(data);
    if(!fs.existsSync(path.join(__dirname,'../public/tmp/chengzi'))){
        fs.mkdirSync(path.join(__dirname,'../public/tmp/chengzi'));
    }

    fs.writeFile('../public/tmp/chengzi/x4.jpg',data,function(err){
        if(err){
            console.log(err.message);
        }
        console.log('saved!');
    })
})

/**
 * note:
 *
 *
 *
 */













