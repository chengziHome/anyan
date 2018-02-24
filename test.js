var fs = require('fs');






var buf = Buffer.alloc(10);
buf.writeUInt16BE(0x01,1);
console.log(buf);






