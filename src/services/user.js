
require('should');
let _ = require('lodash');
let utils = require('utility');
let superagent = require('superagent');
let config = require('../config');
let auth = require('../services/auth');
let { log } = require('../config');
let { User } = require('../models');
let { Account } = require('../models');
let { Order } = require('../models');


exports.indexInfo = async (uid) => {
    let user = await withAccount(uid);
    let account = user.account;
    user = user.baseInfo();
    user.balance = (account.balance / 100).toFixed(2);
    return user;
}

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
        sum += item.priceGet || item.price;
    });
    account.balance /= 100;
    account.undergoing = sum / 100;
    account.total = sum + account.balance;

    return account;
}