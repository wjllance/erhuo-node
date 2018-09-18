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
let { User, Follow } = require('../models');
let srv_follow=require('../services/follow')

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
router.post('/follow', auth.loginRequired, async (ctx, next) => {
    let followed= ctx.request.body. toID;
    auth.assert(followed, "被关注用户无效");
    //let res = await tagService.userPostTag(ctx.state.user, name);
    
    let follow = new Follow();
    follow.fromID = ctx.state.user._id;
    _.assign(follow, _.pick(ctx.request.body, ['toID']));
    await follow.save();

    ctx.body = {
        success: 1,
        data: follow._id.toString()
    };
});


router.post('/goods/publish', auth.loginRequired, async (ctx, next) => {
    let follow = await Follow.find({toID: ctx.state.user._id});

    for(let i = 0; i < follow.length; i ++) {
        auth.assert(images[i].userID.equals(ctx.state.user._id), '图片所有者不正确');
    }

    ctx.body = {
        success: 1,
        data: follow._id.toString()
    };
});



router.get('/follow/show', auth.loginRequired, async (ctx, next) => {
    let pageNo = ctx.query.pageNo || 1;
    let pageSize = Math.min(ctx.query.pageSize || 6, 20); // 最大20，默认6
    let followers = await srv_follow.followList(ctx.state.user._id, pageSize, pageNo);
    ctx.body = {
        success: 1,
        data: followers
    };
});