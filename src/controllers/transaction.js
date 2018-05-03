require('should');
let Router = require('koa-router');

let _ = require('lodash');
let mzfs = require('mz/fs');
let path = require('path');
let body = require('koa-convert')(require('koa-better-body')());

let config = require('../config');
let auth = require('../services/auth');
let srv_transaction = require('../services/transaction');
let srv_wechat = require('../services/wechat');
let { User, Image, Goods } = require('../models');

const router = module.exports = new Router();
const schools = config.CONSTANT.SCHOOL
const school_map = require('../config').CONSTANT.SCHOOL_MAP


router.post('/transaction/withdraw', auth.loginRequired, async (ctx, next) => {
    auth.assert(ctx.request.body.amount, "amount miss");
    let transac = await  srv_transaction.withdraw(ctx.state.user, ctx.request.body.amount);
    let res = await srv_wechat.withdraw(transac._id, ctx.state.user.openid,ctx.request.body.amount);
    transac.status = 1;
    await transac.save();
    ctx.body = {
        success:1,
        data: res
    }
});




