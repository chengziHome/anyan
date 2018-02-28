
const CONST = require('../const');
var xml2js = require('xml2js');
var util = require('util');


class Message{

    constructor(){
        this.mSn = 0;
        this.type = "";
        this.xml = {};                  //JSON,js对象
        this.pictures_size = [];
        this.pictures = [];             //only buf

        this.slices = [];
    }

    init(slices){

        this.mSn = slices[0].mSn;
        this.slices = slices;

    }


    /**
     * 所有slice达到之后，构建message信息.
     * 假设所有的slice都按序到达。
     */
    build(){

        var slices_buf = [];
        console.log("Msg accept slices:total:"+this.slices.length);
        var log_count = 10;
        for(let i=0;i<log_count;i++){
            console.log(this.slices[i].getBuffer());
        }


        for(var i=0;i<this.slices.length;i++){
            slices_buf.push(this.slices[i].getmData());
        }


        var msg_buf = Buffer.concat(slices_buf);


        var mMsglength = this.slices[0].mMsgLength;
        var mLength = this.slices[0].mLength;

        var xml_buf = msg_buf.slice(0,mMsglength);




        var xml_result;
        var xmlParser = new xml2js.Parser();
        // .replace("\ufeff","").replace("\ufffe","")
        // console.log("-------XML_BUF--------");
        // console.log(xml_buf);
        // console.log("xml_buf"+xml_buf);
        // console.log("xml_str:"+xml_buf.toString());
        // console.log("xml_str_utf8:"+xml_buf.toString('utf8'));

        xmlParser.parseString(xml_buf.toString('utf8'),function(err,result){
            if(err){
                console.log("xml error:"+err.message)
            }else{
                console.log("xml object:"+util.inspect(result,false,null));
                xml_result = result;
            }
        });


        //这里可以成功,因为xml2js的Parser默认是同步的
        this.xml = xml_result;


        if(mMsglength==mLength){//非alarm通知,或者alarm没有图片
            console.log("only xml");
            return;
        }else if(this.xml.Notify.$.Type!=CONST.TCP.NOTIFY_ALARM){
            console.log("not only xml ,but not alarm");
        }else{//alarm有图片
            var pictures = this.xml.Notify.Alarming[0].Picture;

            for(let j=0;j<pictures.length;j++){
                this.pictures_size.push(parseInt(pictures[j].$.length));
            }


            //开始解析图片

            var pictures_buf = msg_buf.slice(mMsglength);
            var picture_start = 0;
            var picture_end = 0;

            console.log("msg_buf:"+msg_buf.length+"pic_buf_size:"+pictures_buf.length);

            for(let i=0;i<this.pictures_size.length;i++){
                let pic_len = this.pictures_size[i];
                picture_start = picture_end;
                picture_end = picture_start + pic_len;
                console.log("start:"+pic_len+",end:"+picture_end);
                this.pictures[i] = pictures_buf.slice(picture_start,picture_end);
                console.log(this.pictures[i].length);
            }
        }







    }


    /**
     * 返回整个alarm的信息,JSON对象
     */
    getXml(){
        return this.xml;
    }

    getPictures(){
        return this.pictures;
    }




}

module.exports = Message;







