require('should');
let _ = require('lodash');
let utils = require('utility');
let superagent = require('superagent');
let config = require('../config');
let log4js = require('log4js');
let logger = log4js.getLogger('errorLogger');
let tools = require("./tools");
let auth = require('./auth');
let moment = require('moment');
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

exports.findById = async (id) => {
    await Order.findOne({_id:id});
}

exports.findOrCreate = async function(goods, user) {

    let order = await Order.findOne({
        goodsId: goods._id,
        buyer: user._id
    });
    if(!order) {
        order = new Order({
            goodsId: goods._id,
            seller: goods.userID,
            buyer: user._id,
            price: goods.gprice,
            sn: generateSerialNumber()
        });
        order.goodsInfo = _.pick(goods, ['gname', 'gprice', 'gcost', 'glocation', 'gsummary']);
        order.goodsInfo.img = goods.gpics[0].thumbnails;
        order.markModified('goodsInfo');
        await order.save();
    }
    return order;
};


let getOrderList = exports.getOrderList = async (condi, pageNo, pageSize) => {
    let orders = await Order.find(condi)
        .sort({order_status:1,created_date:-1})
        .limit(pageSize)
        .skip((pageNo-1)*pageSize)
        .populate('buyer')
        .populate('seller');
    orders = _.map(orders, o => o.cardInfo());
    return orders;
}

exports.confirm = async (order) => {
    auth.assert(order.order_status == ORDER_STATUS.PAID, "不可确认收货");
    order.order_status = ORDER_STATUS.COMPLET;
    await order.save();
}

exports.checkPay = async (out_trade_no, result_code, fee)=>{
    let order = await Order.findOne({sn:out_trade_no});
    auth.assert(order, "订单不存在");
    if(result_code == "FAIL"){
        order.pay_status = PAY_STATUS.FAILED;
        await order.save();
        return;
    }
    order.priceGet = fee;
    if(order.price != fee){  // 接入退款
        order.pay_status = PAY_STATUS.WRONG_FEE;
        await order.save();
        logger.error("金额不对");
        console.error("金额不对");
        if(config.ENV != "local")
            return;
    }
    order.pay_status = PAY_STATUS.SUCCEED;
    order.paid_at = moment();
    order.order_status = ORDER_STATUS.PAID;
    await order.save();
};


exports.getDetailById = async (id) => {
    let order = await Order.findById(id)
        .populate('buyer')
        .populate('seller');

    let detail = order.detailInfo();
    return detail;
}