
require('should');
let Router = require('koa-router');

let WXBizDataCrypt = require('../services/WXBizDataCrypt');
let utils = require('utility');
let _ = require('lodash');

let config = require('../config');
let auth = require('../services/auth');
let srv_goods = require('../services/goods');
let srv_comment = require('../services/comment');
let { User } = require('../models');
let { Goods } = require('../models');

const router = module.exports = new Router();

// 登录
/**
 * @api {post}   /user/login   用户登录
 * @apiName     Login
 * @apiGroup    User
 *
 *
 * @apiParam    {String}    code      微信登录code
 *
 * @apiSuccess  {Number}    success     1success
 *
 */
router.post('/user/login', async (ctx, next) => {
    await auth.login(ctx, ctx.request.body.code);
    ctx.body = {
        success: 1,
        data: {user_id: ctx.session.user_id}
    };
});

// 更新基本资料（来自微信）
/**
 * @api {post}   /user/update   用户更新
 * @apiName     Update
 * @apiGroup    User
 */

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

// 我的发布tobe migrate
/**
 * @api {get}   /users/mypublish   我的发布
 * @apiName     MyPublish
 * @apGroup     User
 *
 * @apiParam    {Number}  [isRemoved]   是否下架
 *
 */
router.get('/users/mypublish', auth.loginRequired, async (ctx, next) => {
    let isRemoved = null || ctx.query.isRemoved;  //默认未下架
    let condi = {userID: ctx.state.user._id};  //加入未下架筛选

    if(isRemoved == '1'){
        condi.$and = [{removed_date: {$ne: null}},{removed_date: {$lte: Date.now()}}];
    }
    else if(isRemoved == '0'){
        condi.$or = [{removed_date: null},{removed_date: {$gt: Date.now()}}];
    }
    console.log(condi);
    let goods = await Goods.find(condi).populate('gpics');
    ctx.body = {
        success: 1,
        data: await srv_goods.outputify(goods)
    }
});

// 收藏
/**
 * @api {post}   /user/collect/:goods_id   收藏
 * @apiName     Collect
 * @apiGroup    User
 */
router.post('/users/collect/:goods_id', auth.loginRequired, async (ctx, next) => {
    let user = ctx.state.user;
    let goods = await Goods.findById(ctx.params.goods_id);
    auth.assert(goods, '商品不存在');
    auth.assert(!_.some(user.collections, x => goods._id.equals(x)), '已经收藏');
    user.collections.push(goods._id);
    await user.save();
    ctx.body = {
        success: 1,
    }
});

// 取消收藏
/**
 * @api {post}   /user/uncollect/:goods_id   取消收藏
 * @apiName     Uncollect
 * @apiGroup    User
 */
router.post('/users/uncollect/:goods_id', auth.loginRequired, async (ctx, next) => {
    let user = ctx.state.user;
    let goods = await Goods.findById(ctx.params.goods_id);
    auth.assert(goods, '商品不存在');
    auth.assert(_.some(user.collections, x => goods._id.equals(x)), '已经收藏');
    user.collections = user.collections.filter(x => !goods._id.equals(x));
    await user.save();
    ctx.body = {
        success: 1,
    }
});




