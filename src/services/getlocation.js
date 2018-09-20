require('should');
let superagent = require('superagent');
let {University} = require('../models')

let _ = require('lodash');
exports.getlocation = async  (x,y)=>{
    let { text } = await superagent.get("https://apis.map.qq.com/ws/geocoder/v1/").query({
       location : x+","+y,
        key : "FGPBZ-OX2RV-DLQPQ-UEIK5-JZ2TO-MPB43",
    });
    let data = JSON.parse(text);
    return data;
};
exports.getlocation2 = async  (x,y)=>{
    // let api_url = "http://api.map.baidu.com/geocoder/v2/?callback=renderReverse&location="+x+","+y+"&output=json&pois=1&ak=X7rmP8tzV8f9UG6v318NcwSEwGCBZe9L";
    // let api_url = "https://apis.map.qq.com/ws/geocoder/v1/?location=31.23,121.58&key=FGPBZ-OX2RV-DLQPQ-UEIK5-JZ2TO-MPB43";
    // https://apis.map.qq.com/ws/lace/v1/search?keyword=酒店&boundary=nearby(39.908491,116.374328,1000)&key=OB4BZ-D4W3U-B7VVO-4PJWW-6TKDJ-WPB77
    let { text } = await superagent.get("https://apis.map.qq.com/ws/place/v1/search").query({
        keyword : "大学or学院",
        // location : x+","+y,
        boundary : "nearby("+x+","+y+",1000)",
        key : "FGPBZ-OX2RV-DLQPQ-UEIK5-JZ2TO-MPB43",
    });
    let data = JSON.parse(text);
    return data;
};

exports.universityList = async (location1) =>{

    if(location1==null){
        return "";
    }
    let data = await University.find({
        location: location1
    }).limit(8);
    return data;
};
