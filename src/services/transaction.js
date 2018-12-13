require('should');
let _ = require('lodash');
let utils = require('utility');
let superagent = require('superagent');
let config = require('../config');
let log4js = require('log4js');
let logger = log4js.getLogger('errorLogger');
let auth = require('./auth');
let moment = require('moment');
moment.locale('zh-cn');
/*-----------------------------------------------*/

let { User } = require('../models');
let { Order } = require('../models');
let { Transaction } = require('../models');
let { Account } = require('../models');
let TRANSACTION_TYPE = exports.TRANSACTION_TYPE = config.CONSTANT.TRANSACTION_TYPE;
let TRANSACTION_STATUS = exports.TRANSACTION_STATUS = config.CONSTANT.TRANSACTION_STATUS;

//TODO: 通知！！！
exports.incomeByOrder = async (order) => {
	let account = await Account.findOneOrCreate({ userID: order.seller });
	let transaction = new Transaction({
		accountId: account._id,
		type: TRANSACTION_TYPE.INCOME,
		amount: order.price,
		orderId: order._id,
		// info: {
		//     orderId: order._id
		// }
	});
	// transaction.markModified('info');
	let ret = await transaction.save();
	account.balance = account.balance + order.price;
	await account.save();
	return ret;
};

exports.withdraw = async (user, amount) => {
	let account = await Account.findOneOrCreate({ userID: user._id });
	auth.assert(amount <= account.balance, "余额不足");
	let transaction = new Transaction({
		accountId: account._id,
		type: TRANSACTION_TYPE.WITHDRAW,
		amount: amount,
	});

	account.balance = account.balance - amount;
	account.updated_date = moment();
	await account.save();
	console.log("提现...", account);
	return await transaction.save();
};


exports.createIncome = async (order) => {
	let transaction = await Transaction.findOne({
		orderId: order._id,
		type: TRANSACTION_TYPE.INCOME,
	});
	if (transaction) {
		console.log("exists!, ", transaction);
		return transaction;
	}
	let account = await Account.findOneOrCreate({ userID: order.seller });
	transaction = new Transaction({
		accountId: account._id,
		type: TRANSACTION_TYPE.INCOME,
		amount: order.price,
		orderId: order._id,
	});
	// transaction.markModified('info');

	// account.balance = account.balance + order.price;
	// await account.save();
	return await transaction.save();
};

exports.countdown = async (order) => {
	let transaction = await Transaction.findOne({ orderId: order._id });
	transaction.countdown_date = moment();
	await transaction.save();
};
exports.finish = async (transaction) => {
	auth.assert(!transaction.finished_date, "交易已结束");

	transaction.finished_date = moment();
	let ret = await transaction.save();

	let account = await Account.findById(transaction.accountId);
	account.balance = account.balance + transaction.amount;
	await account.save();

	console.log(moment(), "计时结束，已入账", transaction);
	return ret;
};


exports.createRefund = async (order) => {
	let transaction = await Transaction.findOne({
		orderId: order._id,
		type: TRANSACTION_TYPE.REFUND,
	});
	if (transaction) {
		console.log("exists!, ", transaction);
		return transaction;
	}

	let account = await Account.findOneOrCreate({ userID: order.buyer });
	transaction = new Transaction({
		accountId: account._id,
		orderId: order._id,
		type: TRANSACTION_TYPE.REFUND,
		amount: order.price,
	});
	// transaction.markModified('info');

	return await transaction.save();
};


exports.cancelTran = async (order) => {
	let transaction = await Transaction.findOne({
		orderId: order._id,
		type: TRANSACTION_TYPE.REFUND,
	});
	auth.assert(transaction.type === TRANSACTION_TYPE.REFUND && transaction.status === TRANSACTION_STATUS.INIT, "该交易不能取消退款或已经进行了退款操作");
	transaction.status = TRANSACTION_STATUS.FAILED;

	return await transaction.save();
};


exports.refundConfirm = async (order) => {
	let r_transaction = await Transaction.findOne({
		orderId: order._id,
		type: TRANSACTION_TYPE.REFUND,
	});
	auth.assert(r_transaction && !r_transaction.finished_date, "交易不存在或已结束");
	r_transaction.finished_date = moment();
	r_transaction.status = TRANSACTION_STATUS.SUCCEED;
	let ret = await r_transaction.save();


	//原始订单的交易信息置为失败
	let transaction = await Transaction.findOne({
		orderId: order._id,
		type: TRANSACTION_TYPE.INCOME,
	});
	transaction.status = TRANSACTION_STATUS.FAILED;
	transaction.finished_date = moment();
	await transaction.save();


	let account = await Account.findById(r_transaction.accountId);
	account.balance = account.balance + r_transaction.amount;
	account.updated_date = moment();
	await account.save();

	console.log("已入账...", moment(), account);
	return ret;
	// transaction.markModified('info');

	// return await transaction.save();
};
