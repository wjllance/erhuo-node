
/*
var Sig = require('../libs/tlssdk/lib/TimGenerateSig.js');
let im_config = require('../libs/tlssdk/config/config');



exports.getIMSig = async (identifier)=>{
    let new_config = im_config;
    new_config.identifier = identifier;
    let sig = new Sig(new_config);
    let res = {};
    await sig.genSigAsync(function (userSig, expires) {
        res.userSig = userSig;
        res.expires = expires;
    });
    return res;
};
*/

exports.dateStr = (date) => {
    //获取js 时间戳
    var time=new Date().getTime();
    //去掉 js 时间戳后三位，与php 时间戳保持一致
    // console.log(time+" "+date.getTime())
    time=parseInt((time-date.getTime())/1000);

    //存储转换值
    var s;
    if(time<60*10){//十分钟内
        return '刚刚';
    }else if((time<60*60)&&(time>=60*10)){
        //超过十分钟少于1小时
        s = Math.floor(time/60);
        return  s+"分钟前";
    }else if((time<60*60*24)&&(time>=60*60)){
        //超过1小时少于24小时
        s = Math.floor(time/60/60);
        return  s+"小时前";
    }else if((time<60*60*24*3)&&(time>=60*60*24)){
        //超过1天少于3天内
        s = Math.floor(time/60/60/24);
        return s+"天前";
    }else{
        //超过3天
        // var date= new Date(parseInt(date) * 1000);
        return moment(date).format('ll')
        // return date.getFullYear()+"-"+(date.getMonth()+1)+"-"+date.getDate();
    }
}

exports.completeImgUrl = (img_path) => {
    if(!img_path.startsWith("http")){
        img_path = config.SERVER.URL_PREFIX + '/' + img_path;
    }
    return img_path;
}

exports.thumbnail = (imgurl, width) =>{
    if(!width)
    {
        width = 540;
    }
    return imgurl + "?imageMogr2/thumbnail/"+width+"x";
};


