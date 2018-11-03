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
let { Account, User, Image, Goods, Like } = require('../models');
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
router.post('/comment/:goods_id', async (ctx, next) => {
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

    goods = await srv_goods.getDetailByIdV2(goods._id, ctx.state.user);
    try{
        let sended = await srv_wxtemplate.commentNotify(res._id);
        if(!sended){
            await srv_wechat.sendReplyNotice(res._id);
        }
    }catch (e) {
        console.error("通知失败", e.message);
    }


    ctx.body = {
        success: 1,
        data: goods
    };
});



// router.get('/comment/test', auth.loginRequired, async (ctx, next) => {
//     ctx.body = await srv_wechat.sendReplyNotice(ctx.state.user.sa_openid);
// })




// 收藏
/**
 * @api {post}   /user/collect/:goods_id   收藏
 * @apiName     Collect
 * @apiGroup    User
 */
// router.post('/user/collect/:goods_id', auth.loginRequired, async (ctx, next) => {
//     let user = ctx.state.user;
//     let goods = await Goods.findById(ctx.params.goods_id);
//     auth.assert(goods, '商品不存在');
//     auth.assert(!_.some(user.collections, x => goods._id.equals(x)), '已经收藏');
//     user.collections.push(goods._id);
//     await user.save();
//     ctx.body = {
//         success: 1,
//     }
// });

router.post('/user/collect/:goodsId', auth.loginRequired, async (ctx, next) => {
    let goodsId = ctx.params.goodsId;
    let goods = await Goods.findById(goodsId);
    auth.assert(goods, '商品不存在');
    let res = await Like.findOne({
        userID: ctx.state.user._id,
        goods_id: goodsId
    });

    auth.assert(!res || res.deleted_date, "点过了");

    res = await Like.findOneAndUpdate({
        userID: ctx.state.user._id,
        goods_id: goodsId
    }, {
        deleted_date: null,
        updated_date: new Date()
    }, {new:true, upsert:true});

    goods.like_num ++;
    goods.updated_date = new Date();
    await goods.save();


    ctx.body = {
        success: 1,
        data: res
    }
});

/**
 * @api {post}  /user/like   点赞
 * @apiName     Like
 * @apiGroup    User
 *
 *
 * @apiParam    {String}    goodsId
 *
 *
 */
router.post('/user/like', auth.loginRequired, async (ctx, next) => {
    let goodsId = ctx.request.body.goodsId;
    let goods = await Goods.findById(goodsId);
    auth.assert(goods, '商品不存在');
    let res = await Like.findOne({
        userID: ctx.state.user._id,
        goods_id: goodsId
    });

    auth.assert(!res || res.deleted_date, "点过了");

    res = await Like.findOneAndUpdate({
        userID: ctx.state.user._id,
        goods_id: goodsId
    }, {
        deleted_date: null,
        updated_date: new Date()
    }, {new:true, upsert:true});

    goods.like_num ++;
    goods.updated_date = new Date();
    await goods.save();


    ctx.body = {
        success: 1,
        data: res
    }
});

/**
 * @api {post}  /user/unlike   取消点赞
 * @apiName     Unlike
 * @apiGroup    User
 *
 *
 * @apiParam    {String}    goodsId
 *
 *
 */
router.post('/user/unlike', auth.loginRequired, async (ctx, next) => {
    let goodsId = ctx.request.body.goodsId;
    console.log(ctx.params);
    let goods = await Goods.findById(goodsId);
    auth.assert(goods, '商品不存在');

    let res = await Like.findOne({
        userID: ctx.state.user._id,
        goods_id: goodsId
    });

    auth.assert(res && !res.deleted_date, "没赞过");

    res.deleted_date = new Date();
    res.updated_date = new Date();
    goods.like_num --;
    await res.save();
    await goods.save();

    ctx.body = {
        success: 1,
        data: res
    }
});


// 取消收藏
/**
 * @api {post}   /user/uncollect/:goods_id   取消收藏
 * @apiName     Uncollect
 * @apiGroup    User
 */
// router.post('/user/uncollect/:goods_id', auth.loginRequired, async (ctx, next) => {
//     let user = ctx.state.user;
//     let goods = await Goods.findById(ctx.params.goods_id);
//     auth.assert(goods, '商品不存在');
//     auth.assert(_.some(user.collections, x => goods._id.equals(x)), '已经收藏');
//     user.collections = user.collections.filter(x => !goods._id.equals(x));
//     await user.save();
//     ctx.body = {
//         success: 1,
//     }
// });

router.post('/user/uncollect/:goodsId', auth.loginRequired, async (ctx, next) => {
    let goodsId = ctx.params.goodsId;
    console.log(ctx.params);
    let goods = await Goods.findById(goodsId);
    auth.assert(goods, '商品不存在');

    let res = await Like.findOne({
        userID: ctx.state.user._id,
        goods_id: goodsId
    });

    auth.assert(res && !res.deleted_date, "没赞过");

    res.deleted_date = new Date();
    res.updated_date = new Date();
    goods.like_num --;
    await res.save();
    await goods.save();

    ctx.body = {
        success: 1,
        data: res
    }
});
