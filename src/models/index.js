
let mongoose = require('mongoose');
let config = require('../config');

mongoose.Promise = global.Promise;

let User = exports.User = require('./user');

let Visit = exports.Visit = require('./visit');

let Image = exports.Image = require('./image');

let Goods = exports.Goods = require('./goods');

let Follow = exports.Follow = require('./follow');

let Comment = exports.Comment = require('./comment');

let AccessToken = exports.AccessToken = require('./access_token');

let Order = exports.Order = require('./order');

let Account = exports.Account = require('./account');

let Transaction = exports.Transaction = require('./transaction');

let UserFormid = exports.UserFormid = require('./user_formid');

let Identity = exports.Identity = require('./identity');

let University= exports.University = require('./university');

let Zhaopin = exports.Zhaopin = require('./zhaopin');

let Bargain = exports.Bargain = require('./bargain');

let UserGroup = exports.UserGroup = require('./user_group');

let wxGroup = exports.wxGroup = require('./wxgroup');

let Like = exports.Like = require('./like');

let GroupCheckIn = exports.GroupCheckIn = require('./group_check_in');

let TodayBonus = exports.TodayBonusSchema = require('./today_bonus');

let Version = exports.Version = require('./version');

let Adminuser = exports.Adminuser=require('./admin_user')

let Tag = exports.Tag = require('./tag');

let TagLike = exports.TagLike = require('./tag_like');

let UserTag = exports.UserTag = require('./user_tag');

mongoose.connect(config.MONGODB_URL, {
}, function (err) {
	if (err) {
		config.log.error('connect to %s error: ', config.MONGODB_URL, err.message);
		process.exit(1);
	}
});
