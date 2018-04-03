
let mongoose = require('mongoose');
let config = require('../config');

mongoose.Promise = global.Promise;

let User = exports.User = require('./user');

let Visit = exports.Visit = require('./visit');

let Image = exports.Image = require('./image');

let Goods = exports.Goods = require('./goods');

mongoose.connect(config.MONGODB_URL, {
}, function (err) {
	if (err) {
		config.log.error('connect to %s error: ', config.MONGODB_URL, err.message);
		process.exit(1);
	}
});
