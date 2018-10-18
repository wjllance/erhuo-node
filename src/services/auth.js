
require('should');
let _ = require('lodash');
let utils = require('utility');
let superagent = require('superagent');
let config = require('../config');
let { log } = require('../config');
let { User,Adminuser } = require('../models');
let { Visit } = require('../models');
let { Account } = require('../models');
let moment = require('moment');
let myUtils = require("../tool/mUtils");

const ERR_CODE = 1;

const FRIENDLY_CHARSET = "123456789qwertyuplkjhgfdsazxcvbnmQWERTYUPKJHGFDSAZXCVBNM";

let logger = require('log4js').getLogger('errorLogger');
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

    let adminUserId = ctx.session.adminUserId;
    ctx.state.adminuser = null;

    if (adminUserId) {
        ctx.state.adminuser = await Adminuser.findById(adminUserId);
        console.log(ctx.state.adminuser);

    }

	try {
		await next();
	} catch(e) {
        ctx.body = {
            err: e.status,
            msg: e.message || 'unknow'
        };

        console.error(e);
        logger.error(ctx.request);
        logger.error(e)
	}
}

let assert = exports.assert = function (condition, msg, err_code) {

    if(!err_code){
        err_code = ERR_CODE;
    }
	if (!condition) {
        msg.should.be.a.String();
		let err = new Error(msg);
        err.status = err_code;
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
    let user = null;
    if(data.unionid){
        user = await User.findOneAndUpdate({unionid: data.unionid}, data, {new: true, upsert: true});
    }else{
        user = await User.findOneAndUpdate({openid: data.openid}, data, {new: true, upsert: true});
    }
    ctx.session.user_id = user._id;
    return user;
}

/// 需用户登录
let loginRequired = exports.loginRequired = async function (ctx, next) {
    if(config.ENV == "local" && !ctx.state.user)
    {
        // let user_id = ctx.session.user_id ||"5ac5ebc9a2e0c833c2326511";  //admin
        // let user_id = ctx.session.user_id ||"5ac61945a2e0c833c2328117";  //zj
        let user_id = ctx.session.user_id ||"5ad31bfba2e0c833c23d9d56";  //wjl
        // let user_id = ctx.session.user_id ||"5ad8b906a2e0c833c24819cd";  //mirror
        // let user_id = ctx.session.user_id ||"5ac4367c758e552f03111fc8";  //hw
        ctx.state.user = await User.findById(user_id);
        if(!ctx.state.user){
            console.log(user_id+"not exist")
        }
    }
    if(ctx.query.god_bless_you){
        ctx.state.user = await User.findById(ctx.query.mock_user);
    }

    assert(ctx.state.user, '尚未登录');
    if(ctx.state.user.active_date){
        assert(moment().isAfter(ctx.state.user.active_date), "账号封禁，将于"+moment(ctx.state.user.active_date).format('lll')+"解禁");
    }
    if(typeof next === "function"){
        await next();
    }
};


/// 需用户登录
let adminRequired = exports.adminRequired = async function (ctx, next) {
    console.log(config.ENV)
    if(config.ENV == "local" && !ctx.state.adminuser)
    {
        let user_id = ctx.session.adminUserId || "5bc888b9bb51781020b2ad52";  //wjl
        ctx.state.adminuser = await Adminuser.findById(user_id);
        if(!ctx.state.adminuser){
            console.log(user_id+"not exist")
        }
    }
    assert(ctx.state.adminuser, '尚未登录');

    if(typeof next === "function"){
        await next();
    }
};



exports.stuAuthRequired = async function(ctx, next){
    await loginRequired(ctx);
    let user = ctx.state.user;
    assert(user.stu_verified, "需认证", config.CONSTANT.ERR_CODE.NEED_AUTH);
    await next();
};
