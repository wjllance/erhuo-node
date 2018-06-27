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
let { User, Image, Goods, Like } = require('../models');
let srv_wxtemplate = require('../services/wechat_template');

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
    let goods = await Goods.findById(ctx.params.goods_id);
    auth.assert(goods, '商品不存在');
    let cmt_str = ctx.request.body.comment;
    auth.assert(cmt_str, '评论不能为空');
    let toId = ctx.request.body.to;
    console.log("to id"+toId);
    let secret = ctx.request.body.secret || 0;
    let res = await srv_comment.post(cmt_str, goods._id, ctx.state.user, secret, toId);

    goods.updated_date = Date.now();
    await goods.save();


    // goods = await srv_goods.getDetailById(goods._id, ctx.state.user);
    goods = await srv_goods.getDetailByIdV2(goods._id, ctx.state.user);
    let sended = await srv_wxtemplate.commentNotify(res._id);
    if(!sended){
        await srv_wechat.sendReplyNotice(res._id);
    }

    ctx.body = {
        success: 1,
        data: goods
    };
});



router.post('/like/:goods_id', auth.loginRequired, async (ctx, next) => {
    let user = ctx.state.user;
    let goods = await Goods.findById(ctx.params.goods_id);
    auth.assert(goods, '商品不存在');
    let liken = await Like.findOne({
        userID: ctx.user._id,
        goodsId: goods._id,
        canceled_date: null
    });

    auth.assert(!liken, '已经点过赞了');


    let res = await srv_comment.toggleLike(user._id, goods._id);


    user.collections.push(goods._id);   //TOBE DELETE

    ctx.body = {
        success: 1,
        data: res
    }
});


router.post('/unlike/:goods_id', auth.loginRequired, async (ctx, next) => {
    let user = ctx.state.user;
    let goods = await Goods.findById(ctx.params.goods_id);
    auth.assert(goods, '商品不存在');
    auth.assert(!_.some(user.collections, x => goods._id.equals(x)), '已经点过赞了');

    let res = await srv_comment.like(user._id, goods._id);


    user.collections.push(goods._id);   //TOBE DELETE
    await user.save();
    ctx.body = {
        success: 1,
        data: res
    }
});





// router.get('/comment/test', auth.loginRequired, async (ctx, next) => {
//     ctx.body = await srv_wechat.sendReplyNotice(ctx.state.user.sa_openid);
// })


