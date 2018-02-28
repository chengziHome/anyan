var process = require('process');
var path = require('path');


//node.exe文件的所在路径
console.log(process.execPath);
//执行当前文件的环境目录
console.log(process.cwd());

//当前文件的目录绝对路径
console.log(__dirname);
//当前文件的路径
console.log(__filename);




//用的最多，从当前目录开始拼接。可移植性好
console.log(path.join(__dirname,'../public'));


