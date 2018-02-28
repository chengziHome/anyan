const CONST = require('../const');
var xml2js = require('xml2js');
var util = require('util');


class Alarm{

    constructor(){
        this.mSn = 0;
        this.type = "";
        this.channelID = 0;
        this.stamp = "";
        this.opt = "";
        this.pictures_size = [];
        this.pictures = [];


        // this.sliceCountMax = 0 ;
        this.slices = [];
        // this.currentSliceCount = -1;

    }

    /**
     * 第一块,初始化一个alarm
     * @param firstSlice
     */
    init(slices){

        this.mSn = slices[0].mSn;
        this.slices = slices;

    }

    /**
     *
     * @param slice
     * return :
     * true:是期望的序列slice，接下来调用addSlice
     * false:不是期望的，按照当前的协议版本，应该从home的alarm_msg_list中将这个键值对删除
     */
    isExpected(slice){
        if(this.currentSliceCount+1==slice.mSliceCount){
            return true;
        }else{
            return false;
        }
    }


    /**
     *
     * 如果没有
     * @param slice
     * return:
     * true:代表所有的都接受完，(其内部实际上已经调用了buildAlarm)
     * false:还未完结
     */
    addSlice(slice){
        this.slices[slice.mSliceSn] = slice;
    }

    /**
     * 所有slice达到之后，构建alarm信息.
     * 假设所有的slice都按序到达。
     */
    buildAlarm(){



        var slices_buf = [];
        for(var i=0;i<this.slices.length;i++){
            slices_buf.push(this.slices[i].getmData());
        }

        var msg_buf = Buffer.concat(slices_buf);


        var mMsglength = this.slices[0].mMsgLength;
        var mLength = this.slices[0].mLength;

        var xml_buf = msg_buf.slice(0,mMsglength);





        var xmlParser = new xml2js.Parser();
        xmlParser.parseString(xml_buf.toString('utf8'),function(err,result){
            if(err){
                console.log("xml error:"+err.message)
            }else{
                console.log("xml object:"+util.inspect(result,false,null));
                this.type = result.Notify.Alarming.$.type;
                this.opt = result.Notify.Alarming.$.opt;
                this.stamp = result.Notify.Alarming.$.stamp;
                this.channelID = result.Notify.Alarming.$.channelID;
                var pictures = result.Notify.Alarming.Picture;
                for(let j=0;j<pictures;j++){
                    this.pictures_size.push(pictures[j].$.length);
                }

            }
        });

        if(mMsglength==mLength){//已经解析完，不含图片
            return;
        }


        //开始解析图片
        var pictures_buf = msg_buf.slice(mMsglength);
        var picture_start = mMsglength;
        var picture_end = mLength;

        for(let k=0;k<this.pictures_size.length;k++){
            let pic_len = this.pictures_size[i];
            picture_start = picture_end;
            picture_end = picture_start + pic_len;
            this.pictures[i] = pictures_buf.slice(picture_start,picture_end,'base64');
        }






    }


    /**
     * 返回整个alarm的信息,JSON对象
     */
    getMsg(){
        return {
            type:this.type,
            channelID:this.channelID,
            stamp:this.stamp
        }
    }

    getPictures(){
        return this.pictures;
    }

    getJsonMsg(){

    }


}

module.exports = Alarm;



