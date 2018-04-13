require('should');
let Router = require('koa-router');

let _ = require('lodash');
let mzfs = require('mz/fs');
let path = require('path');
let body = require('koa-convert')(require('koa-better-body')());

let config = require('../config');
let auth = require('../services/auth');
let srv_goods = require('../services/goods');
let srv_comment = require('../services/comment');
let srv_wechat = require('../services/wechat');
let { User, Image, Goods } = require('../models');

const router = module.exports = new Router();


/**
 * @api {post} /comment/:goods_id  商品评论
 * @apiName     CommentPost
 * @apiGroup    Comment
 *
 *
 * @apiParam    {String}    comment     评论内容
 * @apiParam    {String}    [to]          被回复人ID
 *
 * @apiSuccess  {Number}    success     1success
 * @apiSuccess  {Object}    data        商品详情
 *
 */
router.post('/comment/:goods_id', auth.loginRequired, async (ctx, next) => {
    let goods = await srv_goods.getBaseById(ctx.params.goods_id);
    auth.assert(goods, '商品不存在');
    let cmt_str = ctx.request.body.comment;
    auth.assert(cmt_str, '评论不能为空');
    let toId = ctx.request.body.to;
    console.log(toId);
    await srv_comment.post(cmt_str, goods._id, ctx.state.user, toId);
    goods = await srv_goods.getDetailById(goods._id, ctx.state.user);
    ctx.body = {
        success: 1,
        data: goods
    };
});



router.get('/comment/test', async (ctx, next) => {
    ctx.body = await srv_wechat.sendReplyNotice(ctx.state.user.unionid);

})


