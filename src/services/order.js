require('should');
let _ = require('lodash');
let utils = require('utility');
let superagent = require('superagent');
let config = require('../config');
let log4js = require('log4js');
let logger = log4js.getLogger('errorLogger');
let tools = require("./tools");
let moment = require('moment')
moment.locale('zh-cn');
/*-----------------------------------------------*/

let { User  } = require('../models');
let { Order } = require('../models');
let { Goods } = require('../models');

const ORDER_STATUS = require('../config').CONSTANT.ORDER_STATUS;
const PAY_STATUS = require('../config').CONSTANT.PAY_STATUS;
const REFUND_STATUS = require('../config').CONSTANT.REFUND_STATUS;

let SNnumber = 0;

let generateSerialNumber = () => {
    let datetime = moment().format("YYMMDD");
    let No = ('00000'+SNnumber).substr(-4);
    let ts = moment().format('x').substr(-6);
    let rand = ('0000'+Math.ceil(Math.random()*1000)).substr(-4);
    SNnumber = SNnumber + 1;
    return datetime + rand + No + ts;
};

// 获取可以输出的数据
let createOrder = exports.createOrder = async function(goods, user) {

    let order = new Order({
        goodsId: goods._id,
        seller: goods.userID,
        buyer: user._id,
        price: goods.gprice,
        sn: generateSerialNumber()
    });

    order.goodsInfo = _.pick(goods, ['gname', 'gprice', 'gcost', 'glocation', 'gsummary']);
    order.goodsInfo.img = goods.gpics[0].thumbnails;
    order.markModified('goodsInfo');

    console.log(order);
    order.save();
    return order;
};


let getOrderList = exports.getOrderList = async (condi, pageNo, pageSize) => {
    let orders = await Order.find(condi)
        .sort({order_status:1,created_date:-1})
        .limit(pageSize)
        .skip((pageNo-1)*pageSize)
        .populate('buyer')
        .populate('seller');
    return orders;
}

