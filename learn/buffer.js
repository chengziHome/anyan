/**
 * Buffer,
 * 基于v8.9.3的文档
 */


//constructor
//用0x1填充，否则默认是0
const buf1 = Buffer.alloc(10,1);
console.log(buf1);

// 直接创建，而未初始化，可能含有旧值
const buf2 = Buffer.allocUnsafe(10);
console.log(buf2);

const buf3 = Buffer.from([1,2,3]);
console.log(buf3);

//default encoding:utf-8
const buf4 = Buffer.from('test');
console.log(buf4);

const buf5 = Buffer.from('test','latin1');
console.log(buf5);

//构建函数推荐from，而不推荐new Buffer().

// 关于迭代
for (const b of buf4){
    console.log(b);
}

for (const b of buf4.values()){
    console.log(b);
}

for (const b of buf4.keys()){
    console.log(b);
}

for (const b of buf4.entries()){
    console.log(b);
}

//注意这和string.length是不一样的。这里返回的是字节个数，而string那个是返回字符个数
console.log(Buffer.byteLength('chengzi'));
const str = '\u00bd + \u00bc = \u00be';
console.log(`${str}:${str.length}个字符，`+`${Buffer.byteLength(str)}个字节`);

const buf6 = Buffer.from('1234');
const buf7 = Buffer.from('0123');
console.log(Buffer.compare(buf6,buf7));
const arr = [buf6,buf7];
// js的arr.sort()自带策略模式？
console.log(arr.sort(Buffer.compare));

//注意第二个的参数不是列表中buf的个数，而是所有元素的总长度，不过这个值不足实际总长度，结果会截断
console.log(Buffer.concat([buf6,buf7],7));


console.log(Buffer.isEncoding('utf8'));
console.log(Buffer.poolSize)

const buf8 = Buffer.alloc(26);
const buf9 = Buffer.alloc(26).fill('!');
for(let i=0;i<26;i++){
    buf8[i] = i+97;
}


//非常重要的一个函数，拷贝数组一部分，后面三个参数的含义分别是：targetStart,sourceStart,sourceEnd
buf8.copy(buf9,4,16,20);
console.log(buf9.toString());


console.log(buf8.includes('a'));

//下面的一些列读取方式也很重要,BE是大端方式，LE是小端方式
const buf = Buffer.from([1,2,3,4,5,6,7,8]);
console.log(buf);
// 64位双精度
console.log(buf.readDoubleBE());
console.log(buf.readDoubleLE());
// 32位浮点数
console.log(buf.readFloatBE());
console.log(buf.readFloatLE());
// 有符号的8位整数
console.log(buf.readInt8(2));
// 有符号的16位整数
console.log(buf.readInt16BE());
console.log(buf.readInt16LE());



const bb1 = Buffer.from([0x12,0x34,0x56,0x78,0x90,0xab]);
console.log(bb1.readIntBE(0,6).toString(16));
console.log(bb1.readIntLE(0,6).toString(16));

//读取无符号数和上面基本一样，只举一个例子
const bb2 = Buffer.from([0x12,0x34,0x56]);
console.log(bb2.readUInt16BE(0).toString(16));
console.log(bb2.readUInt16LE(0).toString(16));

//读取字符串的实现
const bb3 = Buffer.from('chengzi');
console.log('chengzi:'+bb3.slice(2).toString());




// 注意slice和copy不一样，它仍然指向原始对象的内存区域
console.log(bb2.slice(1,2));

// JSON.stringify(buf),会隐式的调用这个函数
console.log(bb2.toJSON());

// 如不指定，默认按照utf8来解码
console.log(bb2.toString());

//然后是一系列Buffer的write的函数，和上面read基本上是对应的，只不过多一个value参数，为字符串




