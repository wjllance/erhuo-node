
let mongoose = require('mongoose');
let config = require('../config');

mongoose.Promise = global.Promise;

let User = exports.User = require('./user');

let Visit = exports.Visit = require('./visit');

let Image = exports.Image = require('./image');

let Goods = exports.Goods = require('./goods');

let Comment = exports.Comment = require('./comment');

let AccessToken = exports.AccessToken = require('./access_token');

let Order = exports.Order = require('./order');

let Account = exports.Account = require('./account');

let Transaction = exports.Transaction = require('./transaction');

let UserFormid = exports.UserFormid = require('./user_formid');

let Identity = exports.Identity = require('./identity');

let Like = exports.Like = require('./like');

let Bargain = exports.Bargain = require('./bargain');

mongoose.connect(config.MONGODB_URL, {
}, function (err) {
	if (err) {
		config.log.error('connect to %s error: ', config.MONGODB_URL, err.message);
		process.exit(1);
	}
});
