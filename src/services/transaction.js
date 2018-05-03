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
let { Transaction } = require('../models');
let { Account } = require('../models');


exports.incomeByOrder = async (order) => {
    let account = await Account.findOneOrCreate({userID:order.seller});
    let transaction = new Transaction({
        accountId: account._id,
        type:1,
        amount: order.priceGet || order.price,
        info: {
            orderId: order._id
        }
    });
    transaction.markModified('info');

    account.balance = account.balance + order.priceGet;
    await account.save();
    return await transaction.save();
};

exports.withdraw = async (user, amount) =>{
    let account = await Account.findOneOrCreate({userID:user._id});
    auth.assert(amount <= account.balance, "余额不足");
    let transaction = new Transaction({
        accountId:account._id,
        type: 0,
        amount:amount,
    });


    account.balance = account.balance - amount;
    await account.save();
    return await transaction.save();
};