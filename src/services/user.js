
require('should');
let _ = require('lodash');
let utils = require('utility');
let superagent = require('superagent');
let config = require('../config');
let auth = require('../services/auth');
let myUtil = require('../tool/mUtils');

let { log } = require('../config');
let { User, Account, Order, UserFormid, Transaction } = require('../models');
let tagService = require('./tag');

let moment = require('moment');
moment.locale('zh-cn');

exports.indexInfo = async (uid) => {
    let user = await withAccount(uid);
    // let sig = await myUtil.getIMSig(user.tls_id());
    let account = user.account;
    user = user.baseInfo();
    user.balance = account.balance.toFixed(2);
    user.tags = await tagService.baseList(user._id);
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

    let transactions = await Transaction.find({
        accountId: account._id,
        finished_date: {
            $exists: false
        },
        type: {$ne: config.CONSTANT.TRANSACTION_TYPE.WITHDRAW},
        status: config.CONSTANT.TRANSACTION_STATUS.INIT
    });

    console.log("running transactions", transactions);

    let sum = 0;
    // let orders = await Order.find({
    //     seller: uid,
    //     order_status: config.CONSTANT.ORDER_STATUS.PAID,
    //     refund_status: config.CONSTANT.REFUND_STATUS.INIT
    // });
    // orders.forEach((item) => {
    //     sum += item.price;
    // });

    transactions.forEach((item) => {
        sum += item.amount;
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
            if(key == "undefined" || key == "the formId is a mock one"){
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