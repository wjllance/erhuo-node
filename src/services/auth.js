
require('should');
let _ = require('lodash');
let utils = require('utility');
let superagent = require('superagent');
let config = require('../config');
let { log } = require('../config');
let { User } = require('../models');
let { Visit } = require('../models');

const ERR_CODE = 978;

const FRIENDLY_CHARSET = "123456789qwertyuplkjhgfdsazxcvbnmQWERTYUPKJHGFDSAZXCVBNM";

exports.visit = async function (ctx, next) {
    try {
        if (!ctx.query.notrecord) {
            await Visit.create({url: ctx.url, ip: ctx.state.ip, method: ctx.method});
        }
    } catch(e) {
        console.error('Error on visit');
        console.error(e);
    }
    await next();
}

/// 用户中间件
/// 检查用户是否已经登录，查询数据库并放在ctx.state.user变量上
let userM = exports.userM = async function (ctx, next) {
	let user_id = ctx.session.user_id;
    ctx.state.user = null;
    
	if (user_id) {
        ctx.state.user = await User.findById(user_id);
	}

	try {
		await next();
	} catch(e) {
        ctx.body = {
            err: 1,
            msg: e.message || 'unknow'
        };
        console.error(e);
	}
}

let assert = exports.assert = function (condition, msg) {
    msg.should.be.a.String();

	if (!condition) {
		let err = new Error(msg);
        err.status = ERR_CODE;
		throw err;
	}
}

exports.login = async function(ctx, code) {
    let { text } = await superagent.get('https://api.weixin.qq.com/sns/jscode2session').query({
        appid: config.APP_ID,
        secret: config.APP_SECRET,
        js_code: code,
        grant_type: 'authorization_code'
    });
    let data = JSON.parse(text);

    let user = await User.findOneAndUpdate({openid: data.openid}, data, {upsert: true});
    ctx.session.user_id = user._id;
}

/// 需用户登录
exports.loginRequired = async function (ctx, next) {
    assert(ctx.state.user, '尚未登录');
	await next();
}
