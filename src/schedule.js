const schedule = require('node-schedule');
const _ = require('lodash');
let moment = require('moment');
moment.locale('zh-cn');
const superagent = require('superagent');
let path = require('path');
let fs = require('fs');
let log4js = require('log4js');
let logger = log4js.getLogger('errorLogger');

const myUtils = require("./tool/mUtils");
const { Transaction, Order, Goods, User, Like } = require('./models');
const srv_transaction = require('./services/transaction');
const srv_order = require('./services/order');
const srv_wx_template = require("./services/wechat_template");
const schools = require('./tool/school_list');
let config = require('./config');

const AV = require('leancloud-storage');
AV.init({
	appId: config.LEAN_APPID,
	appKey: config.LEAN_APPKEY,
	masterKey: config.LEAN_MASTERKEY,
});

exports.register = function () {
	console.log("register!");

	scheduleOrderCountDown();

	scheduleOrderTimeout();

	// scheduleGoodsExamine();

	// scheduleOldPicsUpload();

	// scheduleOrderImgUpdate();

	// scheduleOldGoodsNotify();

	scheduleUpdateCollection();

	// uploadFakeGoods();

	scheduleComeBack();


	scheduleCompletePay();
};

let scheduleCompletePay = () => {
	schedule.scheduleJob('0 */1 * * * *', async function () {
		let condi = {
			updated_date: {
				$lt: moment().subtract(60, 's').toDate(),
			},
			pay_status: config.CONSTANT.PAY_STATUS.PAYING,
		};


		let orders = await Order.find(condi);
		console.log(moment(), "结束支付状态");

		let res = await Promise.all(_.map(orders, o => srv_order.handleCompletePay(o)));
		console.log("result", res);
	});
};


let scheduleComeBack = () => {

	let ti = '0 0 20 * * *';
	if (config.ENV === 'local') {
		ti = '0 */1 * * * *';
	}
	schedule.scheduleJob(ti, async function () {
		let condi = {
			$or: [
				{
					updated_date: {
						$gte: moment().subtract(2, 'days').toDate(),
						$lt: moment().subtract(1, 'days').toDate(),
					},
				},
				{
					updated_date: {
						$gte: moment().subtract(7, 'days').toDate(),
						$lt: moment().subtract(6, 'days').toDate(),
					},
				},
			],
		};
		if (config.ENV === 'local') {
			condi = {
				$or: [
					{
						updated_date: {
							$gte: moment().subtract(11, 'm').toDate(),
							$lt: moment().subtract(10, 'm').toDate(),
						},
					},
					{
						updated_date: {
							$gte: moment().subtract(3, 'm').toDate(),
							$lt: moment().subtract(2, 'm').toDate(),
						},
					},
				],
			};
		}
		// console.log(condi.$or[1]);
		let users = await User.find(condi);
		console.log("daily notify ...population:", users.length);
		logger.info("daily notify ...population:", users.length);
		for (let i = 0; i < users.length; i++) {
			await srv_wx_template.comeBack(users[i]);
		}
		// total += books.length;
	});
};

let uploadFakeGoods = () => {

	// let count = 12;
	let count = 12;
	let api_url = "https://api.douban.com/v2/book/user/tongchu/collections";

	let total = 0;


	// schedule.scheduleJob('*/5 * * * * *', async function(){
	schedule.scheduleJob('0 */1 * * * *', async function () {

		let users = await User.find({
			openid: {
				// $in: ["oA1su5ZB33if_ZmYp-Syw0LG5UAE","oA1su5Yr4YJ_YO1Xp9L-bDF6OB4g", "123456789", "oA1su5SVjjSD2TZn9-CjkrUqtT7s"],
				$in: ["oA1su5ZbA1EUjAYi_TK70BIUKy5A", "oA1su5c0T7V6LXQ5bGSOjObnflu0", "oA1su5eYCt3SZ7UxocVhthxO5hMw", "oA1su5SVjjSD2TZn9-CjkrUqtT7s", "oA1su5UM4XryAgfwP-WY5VN0CudU", "oA1su5fETBeKhu9g5g50A1RR3eYc", "oA1su5WvztU5dOK2JYcINmaVzOuI", "oA1su5X5ZeNlkhIHC1xGZ0Fa27ms", "oA1su5X5OXS9tbae748UEycrJ9OA", "oA1su5Xf1lzpnwKQIVWz1zBLvPBY", "oA1su5dM9W7zGyiRFiLlL00dQ6Pk", "oA1su5R0RJg6hSCkaFZ_z8A5h6mU", "oA1su5ZpvX5ZzQk9jlcqLbPwXBeY", "oA1su5V-ci2oRTbRlljKLVHcrw2M", "oA1su5alrmL0qelxp3ySL0Pi8S20", "oA1su5c0ICX3Zp172fxyjuMdJMtI", "oA1su5WePnNHcLPAfBXOmMlireY4", "oA1su5dDrpmMSIgYitfqZsJ4T2QE", "oA1su5T-IQarkbhxXlo8EuImQoFc", "oA1su5ZELx6fGYrO0wY9pKwsak6Q", "oA1su5UsI8C2yPGdjcS1n2LwZGzc", "ockK80fSSg9bxNnsB5wMSJKt1m-o"],
			},
		});
		// console.log(users);

		let start = _.random(0, 1900);
		// let start = 0;
		let query_params = {
			start: start,
			count: count,
		};
		let { text } = await superagent.get(api_url).query(query_params);
		let books = JSON.parse(text).collections;
		// console.log(books);

		console.log("books len", books.length);
		// total += await pubbook(users, books,3);
		total += await pubbook(users, books);

		// total += books.length;
		console.log("fake process...", start, total);
		logger.info("fake process...", start, total);
	});
};


let scheduleUpdateCollection = () => {
	schedule.scheduleJob('*/30 * * * * *', async function () {
		let user = await User.findOne({
			"collections.0": { $exists: true },
		});
		if (!user) {
			return;
		}
		console.log("moving like for ...", user);
		let collections = user.collections;
		for (let i = 0; i < 5 && i < user.collections.length; i++) {
			let goodsId = user.collections[i];

			let res = await Like.findOneAndUpdate({
				userID: user._id,
				goods_id: goodsId,
			}, {
				deleted_date: null,
				updated_date: moment(),
			}, { new: true, upsert: true });
			console.log("move likes...", res);
			collections = collections.slice(1);
		}
		user.collections = collections;
		await user.save();
	});
};


let scheduleOldGoodsNotify = () => {

	let ti = '0 0 8 * * *';
	if (config.ENV === 'local') {
		ti = '0 */5 * * * *';
	}
	// schedule.scheduleJob('*/30 * * * * *', async function() {
	schedule.scheduleJob(ti, async function () {
		let condi = {
			updated_date: {
				$lte: moment().subtract(3, 'd').toDate(),
				$gt: moment().subtract(4, 'd').toDate(),
			},
			// status: config.CONSTANT.GOODS_STATUS.RELEASED
			status: { $ne: config.CONSTANT.GOODS_STATUS.REJECT },
			removed_date: null,
		};
		if (config.ENV === 'local') {
			condi.updated_date = {
				$lte: moment().subtract(15, 'm').toDate(),
				$gt: moment().subtract(10, 'm').toDate(),
			};
		}

		let goodsAll = await Goods.find(condi);
		console.log('checking old goods notify...', goodsAll.length);

		for (let i = 0; i < goodsAll.length; i++) {
			let goods = goodsAll[i];
			let res = await srv_wx_template.oldGoodsNotify(goods);
			if (res) {
				goods.updated_date = moment();
				await goods.save();
			} else {
				console.error(goods._id);
			}
		}
	});
};


let scheduleGoodsExamine = () => {
	schedule.scheduleJob('0 */1 * * * *', async function () {
		// schedule.scheduleJob('*/5 * * * * *', async function(){
		console.log('checking goods passed...');
		let ddl = moment({ hour: 20 });
		if (moment().isBefore(ddl)) {
			ddl = ddl.subtract(1, 'd');
		}
		// ddl = moment().subtract(30,'s');
		let condi = {
			status: {
				$in: [
					config.CONSTANT.GOODS_STATUS.PASS,
					// config.CONSTANT.GOODS_STATUS.INIT
				],
			},
			created_date: { $lt: ddl },
		};
		// console.log(condi);
		let goods = await Goods.find(condi);
		// console.log(goods);
		if (goods.length > 0) {
			console.log("updating...count:", goods.length);
			await Goods.updateMany(condi, {
				status: config.CONSTANT.GOODS_STATUS.RELEASED,
			});
		}

	});
};


let scheduleOldPicsUpload = () => {
	schedule.scheduleJob('0 */5 * * * *', async function () {

		let goodsall = await Goods.find({ "npics.0": { $exists: false } }).sort({ created_date: -1 }).populate('gpics').limit(3);

		let goodscount = await Goods.find({ "npics.0": { $exists: false } }).count();
		console.log("checking old pics upload...", goodscount);
		for (let j = 0; j < 3 && j < goodsall.length; j++) {
			let goods = goodsall[j];
			let npics = [];
			for (let i = 0; i < goods.gpics.length; i++) {
				let name = goods.gpics[i]._id + ".jpg";
				let fpath = path.join(config.PUBLIC.root, goods.gpics[i].filename);
				try {
					let img = fs.readFileSync(fpath);
					let file = new AV.File(name, img);
					let res = await file.save();
					npics.push(res.url());
				} catch (e) {
					console.error(goods._id, e);
				}
			}
			goods.npics = npics;
			await goods.save();
			console.log(goods);
		}


		let regex = new RegExp('lcfile', 'i');
		goodsall = await Goods.find({ "npics.0": regex }).limit(3);
		goodscount = await Goods.find({ "npics.0": regex }).count();

		console.log("updating old pics urls...", goodscount);
		for (let j = 0; j < goodsall.length; j++) {
			let goods = goodsall[j];
			npics = [];
			for (let i = 0; i < goods.npics.length; i++) {
				let fn = path.basename(goods.npics[i]);
				npics.push("https://two.jicunbao.com/" + fn);
			}
			goods.npics = npics;
			await goods.save();
			console.log(goods);
		}
	});
};


let scheduleOrderImgUpdate = () => {
	schedule.scheduleJob('0 */5 * * * *', async function () {

		let regex = new RegExp('tmb', 'i');
		let orders = await Order.find({ "goodsInfo.img": regex }).populate('goodsId').sort({ created_date: -1 }).limit(3);

		let orderscount = await Order.find({ "goodsInfo.img": regex }).count();
		console.log("checking old orders img update...", orderscount);
		for (let j = 0; j < 3 && j < orders.length; j++) {
			let order = orders[j];
			try {

				order.goodsInfo.img = myUtils.thumbnail(order.goodsId.npics[0]);
				order.markModified("goodsInfo");
				await order.save();
				console.log(order);
			} catch (e) {
				console.error(order.goodsId);
				await order.remove();
			}
		}

	});
};

let scheduleOrderTimeout = () => {
	schedule.scheduleJob('0 */1 * * * *', async function () {
		// schedule.scheduleJob('*/5 * * * * *', async function(){
		console.log(moment(), 'checking order timeout...');
		let orders = await Order.find({
			updated_date: {
				$lt: moment().subtract(15, 'm').toDate(),
			},
			order_status: config.CONSTANT.ORDER_STATUS.TOPAY,
		});
		console.log("超时取消的订单", orders);
		for (let i = 0; i < orders.length; i++) {
			await srv_order.cancel2(orders[i]);
		}
	});
};

let scheduleOrderCountDown = () => {

	if (config.ENV === "local") {
		schedule.scheduleJob('*/30 * * * * *', async function () {
			console.log(moment(), '检查完成订单...');
			let transactions = await Transaction.find({
				countdown_date: {
					$lt: moment().subtract(30, 's').toDate(),
				},
				status: config.CONSTANT.TRANSACTION_STATUS.INIT,
				finished_date: { $exists: false },
			});
			console.log("正在倒计时的交易", transactions);
			for (let i = 0; i < transactions.length; i++) {
				try {
					await srv_order.finish(transactions[i].orderId);
					await srv_transaction.finish(transactions[i]);
				} catch (e) {
					console.error(e);
				}
			}
		});


	} else {
		schedule.scheduleJob('0 */10 * * * *', async function () {
			console.log('checking normal order countdown...');
			let transactions = await Transaction.find({
				countdown_date: {
					$lt: moment().subtract(71, 'h').subtract(50, 'm').toDate(),
				},
				status: config.CONSTANT.TRANSACTION_STATUS.INIT,
				finished_date: { $exists: false },
			});
			console.log(transactions);
			for (let i = 0; i < transactions.length; i++) {
				try {
					await srv_order.finish(transactions[i].orderId);
					await srv_transaction.finish(transactions[i]);
				} catch (e) {
					console.error(e);
				}
			}
		});

	}
};


let pubbook = async (users, books, locationNum) => {

	let docs = [];
	let school_log = [];
	let total = 0;
	let k = 0;
	for (let j = 0; j < books.length; j++) {
		let cnt = locationNum || _.random(3, 7);
		let book = books[j].book;
		// console.log("book",book);
		let img = book.image;
		let url = await myUtils.uploadImgByUrl(img);

		let reg = /\d+(.\d+)/;
		let res = reg.exec(book.price);
		let price = (res ? res[0] : parseFloat(book.price)) || 20;


		for (let i = 0; i < cnt; i++) {
			k++;
			let idx = k % users.length;
			// console.log(idx, users[idx]);
			let params = {
				userID: users[idx]._id,
				npics: [url],
				gname: book.title,
				gsummary: book.summary,
				gcost: parseFloat(price),
				gprice: ((Math.random() * 0.5 + 0.2) * price).toFixed(2),
				category: "书籍",
				status: 999,
				glocation: _.random(2, schools.length - 1),
			};
			docs.push(params);
			school_log.push(schools[params.glocation]);
		}
		total += cnt;
	}
	console.log(school_log);
	// console.log(docs);
	let goods = await Goods.insertMany(docs);
	// console.log(goods);
	return total;
};
