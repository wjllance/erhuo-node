
require('should');
let Router = require('koa-router');

let WXBizDataCrypt = require('../services/WXBizDataCrypt');
let utils = require('utility');
let _ = require('lodash');

let config = require('../config');
let auth = require('../services/auth');
let { User } = require('../models');

const router = module.exports = new Router();

// 登录
router.post('/user/login', async (ctx, next) => {
    await auth.login(ctx, ctx.request.body.code);
    ctx.body = {
        success: 1
    };
});

// 修改资料
router.post('/user/update', auth.loginRequired, async (ctx, next) => {
    auth.assert(ctx.request.body.signature == utils.sha1(ctx.request.body.rawData + ctx.state.user.session_key), '签名错误1');

    let pc = new WXBizDataCrypt(config.APP_ID, ctx.state.user.session_key);
    let data = pc.decryptData(ctx.request.body.encryptedData, ctx.request.body.iv);

    auth.assert(data.openId == ctx.state.user.openid, '签名错误2');
    auth.assert(data.watermark.appid == config.APP_ID, '水印错误');

    _.assign(ctx.state.user, _.pick(ctx.request.body.userInfo, ['nickName', 'avatarUrl', 'gender', 'city', 'province', 'country', 'language']));
    await ctx.state.user.save();

    ctx.body = {
        success: 1
    };
});
