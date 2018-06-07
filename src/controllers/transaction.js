require('should');
let Router = require('koa-router');

let _ = require('lodash');
let mzfs = require('mz/fs');
let path = require('path');
let body = require('koa-convert')(require('koa-better-body')());

let moment = require('moment');
moment.locale('zh-cn');
let config = require('../config');
let auth = require('../services/auth');
let srv_transaction = require('../services/transaction');
let srv_wechat = require('../services/wechat');
let { User, Image, Goods } = require('../models');

const router = module.exports = new Router();



/**
 * @api     {post}  /transaction/withdraw/  提现
 * @apiName     TransactionWithdraw
 * @apiGroup    Transaction
 *
 * @apiParam    {Number}    amount  数量，最多两位小数
 *
 * @apiSuccess  {Number}    success
 * @apiSuccess  {Object}    data
 *
 */
router.post('/transaction/withdraw', auth.loginRequired, async (ctx, next) => {
    auth.assert(ctx.request.body.amount, "amount miss");
    let amount = ctx.request.body.amount*100;
    //TODO: 原子性！！！！
    let transac = await  srv_transaction.withdraw(ctx.state.user, amount/100);
    let res = await srv_wechat.withdraw(transac._id, ctx.state.user.openid,amount);
    transac.status = 1;
    transac.finished_date = moment();
    await transac.save();
    ctx.body = {
        success:1,
        data: res
    }
});




