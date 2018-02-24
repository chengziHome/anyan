const CONST = require('../utils/const');
var net = require('net');
var Slice = require('../utils/tcp/slice');

HOST = 'localhost';



/**
 * Login
 */

var client = net.createConnection(CONST.PORT.TCP_ALARM,HOST);


client.write(login());


/**
 * 构建一个登录的slice
 */
function login(){
    login_xml = '<Notify Type="Login"><Username>kaola</Username></Notify>';
    slice = new Slice();
    slice.setmVer(0x01);
    slice.setmSn(0x0001);
    slice.setmSliceCount(0x0001);
    slice.setmSliceSn(0x0001);
    var msg = Buffer.from(login_xml);
    slice.setmSliceLength(msg.length);
    slice.setmLength(msg.length);
    slice.setmMsgLength(msg.length);
    slice.setmData(login_xml);

    var buf = slice.getBuffer();
    return buf;


}


































