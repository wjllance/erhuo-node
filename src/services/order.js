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

let { User, Order, Goods, Transaction } = require('../models');
let srv_wxtemplate = require('./wechat_template');
let ORDER_STATUS = exports.ORDER_STATUS = require('../config').CONSTANT.ORDER_STATUS;
let PAY_STATUS = exports.PAY_STATUS = require('../config').CONSTANT.PAY_STATUS;
let REFUND_STATUS = exports.REFUND_STATUS = require('../config').CONSTANT.REFUND_STATUS;

let SNnumber = 0;

let generateSerialNumber = () => {
    let datetime = moment().format("YYMMDD");
    let No = ('00000'+SNnumber).substr(-4);
    let ts = moment().format('x').substr(-6);
    let rand = ('0000'+Math.ceil(Math.random()*1000)).substr(-4);
    SNnumber = SNnumber + 1;
    return datetime + rand + No + ts;
};

exports.updateSN = async (order) => {
    order.sn = generateSerialNumber();
    return await order.save();
};

//goods:CardInfo
exports.findOrCreateV2 = async function(goods, user) {


    let order = await Order.findOne({
        goodsId: goods._id,
        buyer: user._id,
        order_status : {$ne: ORDER_STATUS.CANCEL}
    });
    if(order) return order;

    let orders = await Order.find({ //检查交易中的订单
        goodsId: goods._id,
        refund_status: REFUND_STATUS.INIT,
        order_status: {
            $in: [ORDER_STATUS.PAID, ORDER_STATUS.COMPLETE, ORDER_STATUS.CONFIRM]
        }
    });
    console.log(orders);
    auth.assert(orders.length == 0, "商品交易中，不可下单")


    console.log(orders);
    order = new Order({
        goodsId: goods._id,
        seller: goods.userID,
        buyer: user._id,
        price: goods.gprice,
        order_status: ORDER_STATUS.TOPAY
        // sn: generateSerialNumber()
    });
    order.goodsInfo = _.pick(goods, ['gname', 'gprice', 'gcost', 'glocation', 'gsummary']);
    order.goodsInfo.img = goods.gpics[0].thumbnails;
    order.markModified('goodsInfo');
    await order.save();

    return order;
};



//goods:CardInfo
exports.findOrCreateV3 = async function(goods, user) {


    let order = await Order.findOne({  //检查自己的之前订单
        goodsId: goods._id,
        buyer: user._id,
        order_status : {$ne: ORDER_STATUS.CANCEL}
    });
    if(order) return order;

    if(!goods.remark){
        let orders = await Order.find({ //检查交易中的订单
            goodsId: goods._id,
            refund_status: REFUND_STATUS.INIT,
            order_status: {
                $in: [ORDER_STATUS.PAID, ORDER_STATUS.COMPLETE, ORDER_STATUS.CONFIRM]
            }
        });
        console.log(orders);
        auth.assert(orders.length == 0, "商品交易中，不可下单")
    }


    order = new Order({
        goodsId: goods._id,
        seller: goods.userID,
        buyer: user._id,
        price: goods.gprice,
        // sn: generateSerialNumber()
    });
    order.goodsInfo = _.pick(goods, ['gname', 'gprice', 'gcost', 'glocation', 'gsummary']);
    order.goodsInfo.img = goods.gpics[0].thumbnails;
    order.markModified('goodsInfo');
    order.updated_date = moment();
    return await order.save();
};


exports.findOrCreate = async function(goods, user) {

    let orders = await Order.find({
        goodsId: goods._id,
        refund_status: REFUND_STATUS.INIT,
        order_status: {
            $in: [ORDER_STATUS.PAID, ORDER_STATUS.COMPLETE]
        }
    })
    auth.assert(orders.length == 0, "商品交易中，不可下单")


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


exports.preparePay = async function (order) {
    auth.assert(order.order_status == ORDER_STATUS.TOPAY, "不可支付");

    order.sn = generateSerialNumber();
    let buyer = await User.findById(order.buyer);
    await order.save();
    let price = (config.ENV == 'local') ? 1 : order.price*100;
    let ret = {
        out_trade_no: order.sn,
        body: order.goodsInfo.gname,
        total_fee: price,
        openid: buyer.openid
    };
    return ret
}

exports.preparePayV2 = async function (order) {
    if(order.order_status === ORDER_STATUS.INIT){
        order.order_status = ORDER_STATUS.TOPAY;
        if(!order.sn){
            order.sn = generateSerialNumber();
        }
        await order.save();
    }
    auth.assert(order.order_status === ORDER_STATUS.TOPAY, "不可支付");

    // order.sn = generateSerialNumber();
    //TO BE REMOVE in a few time later

    let buyer = await User.findById(order.buyer);
    // let price = (config.ENV == 'local') ? 1 : order.price*100;
    let price = order.price*100;
    let ret = {
        out_trade_no: order.sn,
        body: order.goodsInfo.gname,
        total_fee: price,
        openid: buyer.openid
    };
    return ret
}

let getOrderList = exports.getOrderList = async (condi, pageNo, pageSize) => {
    let orders = await Order.find(condi)
        // .sort({order_status:1,created_date:-1})
        .sort({created_date:-1})
        .limit(pageSize)
        .skip((pageNo-1)*pageSize)
        .populate('buyer')
        .populate('seller');
    orders = _.map(orders, o => o.cardInfo());
    return orders;
}


exports.checkPay = async (out_trade_no, result_code, fee)=>{
    let order = await Order.findOne({sn:out_trade_no});
    auth.assert(order, "订单不存在");
    auth.assert(order.pay_status == config.CONSTANT.PAY_STATUS.INIT, "已确认");
    if(result_code == "FAIL"){
        order.pay_status = PAY_STATUS.FAILED;
        await order.save();
        return null;
    }
    order.priceGet = fee/100;
    if(order.price != order.priceGet){  // 接入退款
        order.pay_status = PAY_STATUS.WRONG_FEE;
        await order.save();
        logger.error("金额不对");
        console.error("金额不对");
        if(config.ENV != "local")
            return null;
    }
    order.pay_status = PAY_STATUS.SUCCEED;
    order.paid_at = moment();
    order.order_status = ORDER_STATUS.PAID;
    return await order.save();

};


exports.getDetailById = async (id) => {
    let order = await Order.findById(id)
        .populate('buyer')
        .populate('seller');
    auth.assert(order, "订单不存在");
    let detail = order.detailInfo();
    return detail;
}


exports.tradingStatus = async (gid) => {
    let orders = await Order.find({
        goodsId: gid,
        refund_status: REFUND_STATUS.INIT,
        order_status: {
            $in: [ORDER_STATUS.PAID, ORDER_STATUS.COMPLETE, ORDER_STATUS.CONFIRM]
        }
    });
    console.log("orders");
    console.log(orders);
    if(orders.length > 0){
        return "已被抢";
    }else{
        return "我想要";
    }
}

exports.cancel = async (order)=>{
    // auth.assert(order.order_status != order.COMPLETE, "不能取消");
    auth.assert(!order.finished_date, "不能取消");
    order.order_status = ORDER_STATUS.CANCEL;
    await order.save();

    // TODO NOTIFY
}


exports.confirm = async (order) => {
    auth.assert(order.order_status == ORDER_STATUS.PAID, "不能确认");
    order.order_status = ORDER_STATUS.CONFIRM;
    await order.save();

    // TODO NOTIFY
}


exports.complete = async (order) => {
    // auth.assert(order.order_status == ORDER_STATUS.CONFIRM, "不可确认收货");

    auth.assert(order.order_status == ORDER_STATUS.CONFIRM || order.order_status == ORDER_STATUS.PAID, "不可确认收货");
    order.order_status = ORDER_STATUS.COMPLETE;
    order.completed_date = moment();
    await order.save();
    let goods = Goods.findById(order.goodsId);
    await goods.myRemove();
}

exports.autorefund = async (order) => {
    console.log("auto refunding...", order);
    if(order.order_status != ORDER_STATUS.TOPAY && order.refund_status != REFUND_STATUS.SUCCEED){
        await srv_wechat.refund(order.sn);
    }
};

exports.refund_apply = async(order) =>{
    auth.assert(order.refund_status == REFUND_STATUS.INIT && order.pay_status == PAY_STATUS.SUCCEED, "不可申请退款");
    auth.assert(!order.finished_date, "订单已结束，申请退款请私下联系或联系客服");
    order.refund_status = REFUND_STATUS.APPLYING;
    await order.save();
    //TODO SEND NOTIFY
};

exports.refund_confirm = async(order) =>{
    auth.assert(order.refund_status == REFUND_STATUS.APPLYING, "不可确认退款");
    order.refund_status = REFUND_STATUS.SUCCEED;
    await order.save();
    //TODO SEND NOTIFY
};

exports.finish = async(orderId) => {
    let order = await Order.findById(orderId);
    auth.assert(order, "订单不存在");
    auth.assert(order.refund_status == REFUND_STATUS.INIT && order.order_status == ORDER_STATUS.COMPLETE, "不能结束，请检查订单状态");
    order.finished_date = moment();
    await order.save();

    //NOTIFY
    await srv_wxtemplate.moneyArrive(order);
}