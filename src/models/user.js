let mongoose = require('mongoose');
let _ = require('lodash');
let school_map = require('../config').CONSTANT.SCHOOL_MAP;
let config = require('../config');
let moment = require('moment');
// 用户
let userSchema = new mongoose.Schema({

        // 微信登录验证和标识信息
        openid: {
            type: String,
            require: true,
            index: true,
        },
        session_key: String,
        unionid: {
            type: String,
            index: true,
        },
        sa_openid: String,
        location: {
            type: Number,
            default: 0,
        },
        locationName: String,

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
                type: mongoose.Schema.ObjectId,
                ref: 'Goods',
            }],
            default: [],
        },

        tls_imported: {
            type: Boolean,
            default: 0,
        },
        created_date: { type: Date, default: Date.now },
        updated_date: { type: Date, default: Date.now },
        message_date: Date,

        phoneNumber: String,


        stu_verified: Date,
        realname: String,
        school: String,
        nested: {
            gender: String,
            birthday: String,
            realname: String,
            school: String,
            department: String,
            number: String,
            origin: String,
        },

        active_date: { type: Date, default: moment().subtract(1, 'days') },
    }
    , { versionKey: false },
);


//自己可以看的信息
userSchema.methods.baseInfo = function () {
    let output = _.pick(this, ["_id", "nickName", "avatarUrl", "gender", 'phoneNumber']);

    output.location = this.locationName || school_map[this.location];

    output.stu_verified = this.stu_verified ? "已认证" : "未认证";
    if (this.stu_verified) {
        output.verify = "学生认证";
        output.school = this.school;
        output.realname = this.realname;

    }
    return output;
};


//所有人可见信息
userSchema.methods.cardInfo = function () {

    let verify = "";
    if (this.stu_verified) {
        verify = "学生认证";
    }
    let ret = _.pick(this, ['_id', 'nickName', 'avatarUrl']);
    ret.verify = verify;

    ret.location = this.locationName || school_map[this.location];

    if (this.locationName) {
        ret.location = this.locationName;
    }
    return ret;
};


userSchema.methods.tls_id = function () {
    if (config.ENV === "production") {
        return "O" + this._id;
    } else {
        return "D" + this._id;
    }
};


module.exports = mongoose.model("User", userSchema);
