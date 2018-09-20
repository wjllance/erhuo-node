require('should');
let superagent = require('superagent');
let { University } = require('../models');

let _ = require('lodash');

exports.getCityName = async (x, y) => {
    let { text } = await superagent.get("https://apis.map.qq.com/ws/geocoder/v1/").query({
        location: x + "," + y,
        key: "FGPBZ-OX2RV-DLQPQ-UEIK5-JZ2TO-MPB43",
    });
    let data = JSON.parse(text);

    return data.result.address_component.city;
};

exports.universityList = async (location1) => {

    if (location1 == null) {
        return "";
    }
    let data = await University.find({
        location: location1,
    }).limit(8);
    return data;
};
