require('should');
let superagent = require('superagent');
// let logger = log4js.getLogger('errorLogger');
let _ = require('lodash');
let { City } = require('../models');

exports.getlocation = async  (x,y)=>{



    // let api_url = "http://api.map.baidu.com/geocoder/v2/?callback=renderReverse&location="+x+","+y+"&output=json&pois=1&ak=X7rmP8tzV8f9UG6v318NcwSEwGCBZe9L";
    let api_url = "https://apis.map.qq.com/ws/geocoder/v1/?location=31.23,121.58&key=FGPBZ-OX2RV-DLQPQ-UEIK5-JZ2TO-MPB43";
    let City = await superagent.get(api_url);

    console.log(City.status+"aaaaaa");
    // console.log(City.addressComponent[0].city+"aaaaaa");

    // let res = JSON.parse(data);
    console.log("aaaaa");
    return City;
};
