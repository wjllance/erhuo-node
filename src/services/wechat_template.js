require('should');
let _ = require('lodash');
let utils = require('utility');
let superagent = require('superagent');
let config = require('../config');
let log4js = require('log4js');
let logger = log4js.getLogger('errorLogger');
let tools = require("./tools");
let moment = require('moment');
moment.locale('zh-cn');
/*-----------------------------------------------*/
let auth = require('./auth');
const xml2js = require('xml2js');
let fs = require('fs');
let path = require('path');
let {User, AccessToken, Comment, Order, UserFormid} = require('../models');
let srv_wechat = require('./wechat');


let sendMinaTempMsg = exports.sendMinaTempMsg = async (touser, template_id, form_id, data, page, color, emphasis_keyword) => {
    let access_token = await srv_wechat.get_access_token(srv_wechat.TYPE_MINA);
    console.log(access_token);
    let post_url = "https://api.weixin.qq.com/cgi-bin/message/wxopen/template/send?access_token="+access_token;
    let {text} = await superagent.post(post_url).send({
        touser: touser,
        template_id: template_id,
        page: page,
        data: data,
        form_id: form_id
    });
    let res = JSON.parse(text);
    console.log(res);
    return res
};

let getFormid = async(userid) => {
    let formid = await UserFormid.findOne({
        user_id: userid,
        expire_date: {$gt: moment()},
        used: {$ne: 1}
    }).sort({expire_date:1});
    console.log(formid);
    auth.assert(formid, "temp id not enough");
    // if(!formid){
    //     logger.warn("temp id not enough", fromuser, touser, content);
    //     console.error("temp id not enough", fromuser, touser, content);
    //     return null;
    // }
    return formid;
};

exports.sendPaidTemplate = async(order) => {
    let seller_id = order.seller._id || order.seller;
    let buyer_id = order.buyer._id || order.buyer;

    let touser = await User.findById(seller_id);
    let buyer = await  User.findById(buyer_id);
    let formid = await getFormid(touser._id);
    let template_id = "YguybxI3FIF3xffJsWQX6qoETcDhmCDpeLblF_yENMM";
    let page = "pages/news/news";
    let data = {
        //温馨提示
        keyword1:{
            value: "订单已支付，请尽快与买家约定时间地点进行交易"
        },
        //物品名称
        keyword2:{
            value:order.goodsInfo.gname
        },
        //订单号
        keyword3: {
            value:order.sn
        },
        //订单状态
        keyword4:{
            value: "已支付"
        },
        //订单金额
        keyword5:{
            value: order.price
        },
        //收货人
        keyword6:{
            value: buyer.nickName
        },
        //收货人电话
        keyword7:{
            value:"手机号正在接入中"
        }
    };

    formid.used = 1;
    await formid.save();
    await sendMinaTempMsg(touser.openid, template_id, formid.formid, data, page)
};


exports.confirmReceipt = async(order) =>{
    let seller_id = order.seller._id || order.seller;
    let buyer_id = order.buyer._id || order.buyer;

    let touser = await User.findById(seller_id);
    let buyer = await  User.findById(buyer_id);
    let formid = await getFormid(touser._id);
    let template_id = "h-AKhqlnkoDY9GdfRTylKV6oxROCT0Ooo49aLerkHNM";
    let page = "pages/news/news";
    let data = {
        //温馨提示
        keyword1:{
            value: "买家已收货，为确保双方权益，订单金额72小时之后方可提现"
        },
        //订单状态
        keyword2:{
            value: "已收货"
        },
        //订单号
        keyword3: {
            value:order.sn
        },
        //物品名称
        keyword4:{
            value:order.goodsInfo.gname
        },
        //订单金额
        keyword5:{
            value: order.price
        },
        //收货人
        keyword6:{
            value: buyer.nickName
        },
        //收货人电话
        keyword7:{
            value:"手机号正在接入中"
        }
    };

    formid.used = 1;
    await formid.save();
    await sendMinaTempMsg(touser.openid, template_id, formid.formid, data, page)
};


exports.moneyArrive = async(order)=>{
    let seller_id = order.seller._id || order.seller;

    let touser = await User.findById(seller_id);
    let formid = await getFormid(touser._id);
    let template_id = "GUJN0AyeyDJjvN6rwSNg_b3HnuzOohBxKkDBGonZGW0";
    let page = "pages/news/news";
    let data = {
        //温馨提示
        keyword1:{
            value: "订单金额已到账，可进入我的钱包提现"
        },
        //商品名称
        keyword2:{
            value: order.goodsInfo.gname
        },
        //订单号
        keyword3: {
            value: order.sn
        },
        //入账金额
        keyword4:{
            value: order.price
        },
        //入账时间
        keyword5:{
            value: moment().format('lll')
        },
    };

    formid.used = 1;
    await formid.save();
    await sendMinaTempMsg(touser.openid, template_id, formid.formid, data, page)
};


exports.refundApply = async(order) => {
    let seller_id = order.seller._id || order.seller;
    let buyer_id = order.buyer._id || order.buyer;

    let touser = await User.findById(seller_id);
    let buyer = await  User.findById(buyer_id);
    let formid = await getFormid(touser._id);
    let template_id = "8r3D3uYC9Suj-W_Ri4WdupT3t7zO5hz4oaCdBVdhp6M";
    let page = "pages/news/news";
    let data = {
        //温馨提示
        keyword1:{
            value: "买家申请退货，请及时处理退货申请或联系客服拒绝退货"
        },
        //订单编号
        keyword2:{
            value: order.sn
        },
        //商品名称
        keyword3: {
            value:order.goodsInfo.gname
        },
        //退款金额
        keyword4:{
            value:order.price
        },
        //退款人
        keyword5:{
            value: buyer.nickName
        },
        //退款人手机
        keyword6:{
            value: "手机号正在接入中"
        },
        //申请时间
        keyword7:{
            value: moment().format('lll')
        },
    };

    formid.used = 1;
    await formid.save();
    await sendMinaTempMsg(touser.openid, template_id, formid.formid, data, page)
};


exports.refundConfirm = async(order) =>{
    let buyer_id = order.buyer._id || order.buyer;
    let touser = await User.findById(buyer_id);
    let formid = await getFormid(touser._id);
    let template_id = "gqC4nVJRmqjL_mFAifx4h7-cg9upXxXEmfr5wNYwd3k";
    let page = "pages/news/news";
    let data = {
        //温馨提示
        keyword1:{
            value: "退款已到账，可到我的钱包提现"
        },
        //订单号
        keyword2:{
            value: order.sn
        },
        //商品名称
        keyword3: {
            value:order.goodsInfo.gname
        },
        //退款金额
        keyword4:{
            value:order.price
        },
        //到账时间
        keyword5:{
            value: moment().format('lll')
        },
    };

    formid.used = 1;
    await formid.save();
    await sendMinaTempMsg(touser.openid, template_id, formid.formid, data, page)
};

