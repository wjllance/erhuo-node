
require('should');
let _ = require('lodash');
let utils = require('utility');
let superagent = require('superagent');
let config = require('../config');
let auth = require('../services/auth');
let myUtil = require('../myUtils/myUtil');

let { log } = require('../config');
let { User } = require('../models');
let { Account } = require('../models');
let { Order } = require('../models');
let { UserFormid } = require('../models');

let moment = require('moment');
moment.locale('zh-cn');

exports.indexInfo = async (uid) => {
    let user = await withAccount(uid);
    // let sig = await myUtil.getIMSig(user.tls_id());
    let account = user.account;
    user = user.baseInfo();
    user.balance = account.balance.toFixed(2);
    return user;
};

let withAccount = exports.withAccount = async (uid) => {

    let userAccount = await Account.findOne({userID: uid}).populate('userID');
    auth.assert(userAccount, "用户不存在");
    let user = userAccount.userID;
    _.unset(userAccount, 'userID');
    user.account = userAccount;
    return user;
}

exports.walletInfo = async(uid) => {
    let account = await Account.findOne({userID: uid});
    account = account.baseInfo();
    let orders = await Order.find({
        seller: uid,
        order_status: config.CONSTANT.ORDER_STATUS.PAID,
        refund_status: config.CONSTANT.REFUND_STATUS.INIT
    });
    sum = 0;
    orders.forEach((item) => {
        sum += item.price;
    });

    account.total = (sum + account.balance).toFixed(2);
    account.undergoing = sum.toFixed(2);
    account.balance = account.balance.toFixed(2);
    return account;
};


exports.pushFormIds = async (user_id, formIds)=>{
    console.log(formIds);
    for(let key in formIds){
        try{
            if(key == "undefined" && key == "the formId is a mock one"){
                continue;
            }
            let userFormid = new UserFormid();
            userFormid.user_id = user_id;
            userFormid.formid = key;
            userFormid.expire_date = new moment(formIds[key]);
            await userFormid.save();
        }catch (e) {
            console.error(e)
        }

    }
    let total = await UserFormid.find({user_id: user_id}).count();
    return total;
}