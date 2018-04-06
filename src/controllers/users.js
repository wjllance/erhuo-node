
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
router.post('/user/login', async (ctx, next) => {
    await auth.login(ctx, ctx.request.body.code);
    ctx.body = {
        success: 1
    };
});

// 更新基本资料（来自微信）
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

// 我的发布
router.get('/users/mypublish', auth.loginRequired, async (ctx, next) => {
    let goods = await Goods.find({userID: ctx.state.user._id}).populate('gpics');
    ctx.body = {
        success: 1,
        data: await srv_goods.outputify(goods)
    }
});

// 收藏
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

// 所有收藏
// 分页参数为pageNo(默认为1), pageSize(默认为6)
// 返回值为 goods(list), hasMore(有下一页), total(记录总条数)
router.get('/users/collections', auth.loginRequired, async (ctx, next) => {
    let total = await Goods.find({_id: ctx.state.user.collections}).count();//用户总收藏数
    let reqParam= ctx.query;
    let pageNo = 1;
    if (reqParam.pageNo) {pageNo = Number(reqParam.pageNo);}  //页码数, 默认为1
    let pageSize = 6;
    if (reqParam.pageSize) {pageSize = Number(reqParam.pageSize);}//每页显示的记录条数, 默认为6
    console.log(pageNo);console.log(pageSize);
    let collections = await Goods.find({_id: ctx.state.user.collections}).limit(pageSize).skip((pageNo-1)*pageSize).populate('gpics');
    let hasMore=total-pageNo*pageSize>0;
    ctx.response.type = 'application/json';
    ctx.body = {
        success: 1,
        data: {
            goods: await srv_goods.outputify(collections, ctx.state.user),
            hasMore:hasMore,
            total:total
        }
    };
});

// 我的留言
router.get('/users/my_comments', auth.loginRequired, async (ctx, next) => {
    let my_comments = await srv_comment.getMyComments(ctx.state.user._id);

    ctx.body = {
        success: 1,
        data: await srv_goods.outputify(collections, ctx.state.user)
    }
});