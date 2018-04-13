
let mongoose = require('mongoose');
let _ = require('lodash');

// 用户
let userSchema = new mongoose.Schema({

	// 微信登录验证和标识信息
	openid: {
		type: String,
		index: true
	},
	session_key: String,
	unionid: {
		type: String,
		required: true,
		index: true
    },
	sa_open_id: String,

	// 以下是从微信获取到的用户数据
	nickName: String,
	avatarUrl: String,
	gender: String,
	city: String,
	province: String,
	country: String,
	language: String,

	// 收藏
	collections: {
		type: [{
			type : mongoose.Schema.ObjectId,
			ref : 'Goods',
		}],
		default: []
	},

	created_date: { type: Date, default: Date.now },
});

module.exports = mongoose.model("User", userSchema);
