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
    let touser = await User.findById(order.seller);
    let buyer = await  User.findById(order.buyer);
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
    return await sendMinaTempMsg(touser.openid, template_id, formid.formid, data, page)
};