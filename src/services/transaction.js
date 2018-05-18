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
let TRANSACTION_TYPE = config.CONSTANT.TRANSACTION_TYPE;

//TODO: 通知！！！
exports.incomeByOrder = async (order) => {
    let account = await Account.findOneOrCreate({userID:order.seller});
    let transaction = new Transaction({
        accountId: account._id,
        type: TRANSACTION_TYPE.INCOME,
        amount: order.price,
        info: {
            orderId: order._id
        }
    });
    transaction.markModified('info');

    account.balance = account.balance + order.price;
    await account.save();
    return await transaction.save();
};

exports.withdraw = async (user, amount) =>{
    let account = await Account.findOneOrCreate({userID:user._id});
    auth.assert(amount <= account.balance, "余额不足");
    let transaction = new Transaction({
        accountId:account._id,
        type: TRANSACTION_TYPE.WITHDRAW,
        amount: amount,
    });

    account.balance = account.balance - amount;
    await account.save();
    return await transaction.save();
};


exports.createIncome = async(order)=>{
    let account = await Account.findOneOrCreate({userID:order.seller});
    let transaction = await Transaction.findOne({
        accountId: account._id,
        orderId: order._id
    });
    if(transaction){
        console.log("exists!, ", transaction);
        return transaction;
    }

    transaction = new Transaction({
        accountId: account._id,
        type: TRANSACTION_TYPE.INCOME,
        amount: order.price,
        orderId: order._id
    });
    transaction.markModified('info');

    // account.balance = account.balance + order.price;
    // await account.save();
    return await transaction.save();
}

exports.countdown = async(order) => {
    let transaction = await Transaction.findOne({orderId: order._id});
    transaction.countdown_date = moment();
    await transaction.save();
    console.log("countdown begin...", moment());
};

let transacFinish = exports.finish = async(transaction) => {
    let account = await Account.findById(transaction.accountId);
    account.balance = account.balance + transaction.amount;
    transaction.finished_date = moment();
    await transaction.save();
    if(transaction.orderId){
        let order = await Order.findById(transaction.orderId);
        order.finished_date = moment();
        await order.save();
    }
    await account.save();

    console.log("countdown end...", moment());
};