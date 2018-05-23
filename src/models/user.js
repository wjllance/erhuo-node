
let mongoose = require('mongoose');
let _ = require('lodash');
let school_map = require('../config').CONSTANT.SCHOOL_MAP
let config = require('../config')
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
		index: true
    },
	sa_openid: String,
	location: {
		type: Number,
		default: 0
    },
	// stu_verified: Boolean,

	// 以下是从微信获取到的用户数据
	nickName: String,
	avatarUrl: String,
	gender: String,
	city: String,
	province: String,
	country: String,
	language: String,
	isAdmin: Boolean,
	// 收藏
	collections: {
		type: [{
			type : mongoose.Schema.ObjectId,
			ref : 'Goods',
		}],
		default: []
	},
	tls_imported: {
        type: Boolean,
        default: 0
    },
    created_date: { type: Date, default: Date.now },
    updated_date: { type: Date, default: Date.now },
}
, {versionKey:false}
);

userSchema.methods.baseInfo = function(){
	let output = _.pick(this, ["_id", "nickName", "avatarUrl", "gender"]);
	output.location = school_map[this.location];
	return output;
};

userSchema.methods.tls_id = function(){
    if(config.ENV == "production"){
        return "O"+this._id;
    }else{
        return "D"+this._id;
    }
};


module.exports = mongoose.model("User", userSchema);
