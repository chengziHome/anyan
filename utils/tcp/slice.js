const CONST = require('../const');

class Slice {


    // 用于发送数据
    constructor(){
        this.mVer;                      // UInt16, Protocol Version
        this.mSn ;                      // UInt32, Slice group's no  ，
        this.mSliceCount ;              // UInt32, slice count
        this.mSliceSn ;                 // UInt32, slice sequence number
        this.mSliceLength ;             // UInt32, current slice length without headers(26)
        this.mLength;                   // UInt32, primitive data length(including many slices,but no headers)
        this.mMsgLength;                // UInt32, message length without picture length

        this.mData;                     // String, even it includes picture
        this.buffer = null;
    }

    //用于接受slice
    init(buf){
        try{
            this.buffer = buf;
            this.mVer = buf.readUInt16BE();
            this.mSn = buf.readUInt32BE(2);
            this.mSliceCount = buf.readUInt32BE(6);
            this.mSliceSn = buf.readUInt32BE(10);
            this.mSliceLength = buf.readUInt32BE(14);
            this.mLength = buf.readUInt32BE(18);
            this.mMsgLength = buf.readUInt32BE(22);

            this.mData = buf.slice(26).toString();

        }catch(err){
            console.log("Slice 构造出错"+err.message);
        }

    }



    getBuffer(){
        // that's,this.buffer will be initialized only once
        if(this.buffer==null){
            var buf = Buffer.alloc(this.mSliceLength+CONST.TCP.HEADER_LENGTH);
            buf.writeUInt16BE(this.mVer);
            buf.writeUInt32BE(this.mSn,2);
            buf.writeUInt32BE(this.mSliceCount,6);
            buf.writeUInt32BE(this.mSliceSn,10);
            buf.writeUInt32BE(this.mSliceLength,14);
            buf.writeUInt32BE(this.mLength,18);
            buf.writeUInt32BE(this.mMsgLength,22);
            buf.write(this.mData,26);

            this.buffer = buf;
        }
        return this.buffer;

    }


    toString(){
        return '{' +
            'mVer:'           +   this.mVer           +
            ',mSn:'           +   this.mSn            +
            ',mSliceCount:'   +   this.mSliceCount    +
            ',mSliceSn:'      +   this.mSliceSn       +
            ',mSliceLength:'  +   this.mSliceLength   +
            ',mLength:'       +   this.mLength        +
            ',mMsgLength:'    +   this.mMsgLength     +
            ',data:'    +   this.mData    +
            '}'
    }



    /**
     *
     * get/set method
     *
     */
    getmVer(){
        return this.mVer;
    }
    setmVer(version){
        this.mVer = version;
    }

    getmSn(){
        return this.mSn;
    }
    setmSn(sn){
        this.mSn = sn;
    }

    getmSliceCount(){
        return this.mSliceCount;
    }
    setmSliceCount(sliceCount){
        this.mSliceCount = sliceCount;
    }

    getmSliceSn(){
        return this.mSliceSn;
    }
    setmSliceSn(sliceSn){
        this.mSliceSn = sliceSn;
    }

    getmSliceLength(){
        return this.mSliceLength;
    }
    setmSliceLength(sliceLength){
        this.mSliceLength = sliceLength;
    }

    getmLength(){
        return this.mLength;
    }
    setmLength(len){
        this.mLength = len;
    }

    getmMsgLength(){
        return this.mMsgLength;
    }
    setmMsgLength(msgLength){
        this.mMsgLength = msgLength;
    }

    getmData(){
        return this.mData;
    }
    setmData(data){
        this.mData = data;
    }



}


module.exports = Slice





