require('should');
let superagent = require('superagent');
let { University, User } = require('../models');

let _ = require('lodash');

exports.getCityName = async (lng, lat) => {
    let { text } = await superagent.get("https://apis.map.qq.com/ws/geocoder/v1/").query({
        location: lat + "," + lng,
        key: "FGPBZ-OX2RV-DLQPQ-UEIK5-JZ2TO-MPB43",
    });
    let data = JSON.parse(text);

    return data.result.address_component.city;
};
exports.universityList = async (location1) => {

    if (location1 == null) {
        return "";
    }
    let data1 = await University.find({
        location: location1,
    });
    let data2 = [];
    let result = await User.aggregate([
        {
            $group: {
                _id: "$location", //要聚合的字段 相当于group by
                count: {$sum: 1} //统计的数量
            }
        },
        {$sort: {count: -1}}//对统计进行排序，1代表升序
    ]);
    console.log(result);
    for (var r in result) {
        for (var i = 0; i < data1.length; i++) {
            if (result[r]._id === data1[i].locationNum) {
                let t = data1[i].toObject();
                t.population =  result[r].count;
                data2.push(t);
                break;
            }
        }
        if (data2.length > 8) {
            break;
        }
    }
    return data2;
};
