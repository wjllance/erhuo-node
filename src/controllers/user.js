
require('should');
let Router = require('koa-router');

let WXBizDataCrypt = require('../services/WXBizDataCrypt');
let utils = require('utility');
let _ = require('lodash');

let config = require('../config');
let auth = require('../services/auth');
let tools = require('../services/tools');
let srv_goods = require('../services/goods');
let srv_comment = require('../services/comment');
let srv_user = require('../services/user');
let { User } = require('../models');
let { Goods } = require('../models');
// const schools = config.CONSTANT.SCHOOL;
const school_map = config.CONSTANT.SCHOOL_MAP;
let moment = require('moment');
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

    console.log("here is update")

    auth.assert(ctx.request.body.signature === utils.sha1(ctx.request.body.rawData + ctx.state.user.session_key), '签名错误1');

    let pc = new WXBizDataCrypt(config.APP_ID, ctx.state.user.session_key);
    let data = pc.decryptData(ctx.request.body.encryptedData, ctx.request.body.iv);

    auth.assert(data.openId === ctx.state.user.openid, '签名错误2');
    auth.assert(data.watermark.appid === config.APP_ID, '水印错误');
    console.log(data);
    _.assign(ctx.state.user, _.pick(ctx.request.body.userInfo, ['nickName', 'unionid', 'avatarUrl', 'gender', 'city', 'province', 'country', 'language']));
    ctx.state.user.unionid = data.unionId;
    ctx.state.user.updated_date = moment();
    let user = await ctx.state.user.save();

    let userIndex = await srv_user.indexInfo(user._id);
    ctx.body = {
        success: 1,
        data: userIndex
    };
});



router.post('/user/phone', auth.loginRequired, async (ctx, next) => {

    console.log("here is update phone");


    let pc = new WXBizDataCrypt(config.APP_ID, ctx.state.user.session_key);
    let data = pc.decryptData(ctx.request.body.encryptedData, ctx.request.body.iv);

    auth.assert(data.watermark.appid === config.APP_ID, '水印错误');
    console.log(data);

    _.assign(ctx.state.user, _.pick(data, ['phoneNumber']));
    let user = await ctx.state.user.save();
    console.log(user);

    let userIndex = await srv_user.indexInfo(user._id);
    ctx.body = {
        success: 1,
        data: userIndex
    };
});

/**
 * @api {post}   /user/update_mina   小程序内用户更新
 * @apiName     UpdateMina
 * @apiGroup    User
 */

router.post('/user/update_mina', auth.loginRequired, async (ctx, next) => {

    let userInfo = ctx.request.body.userInfo;
    if(userInfo.location){
        let locationIndex = school_map.indexOf(userInfo.location);
        userInfo.location =  locationIndex > 0 ? locationIndex : 0;
        // userInfo.location = tools.locationTransform(userInfo.location);
    }
    _.assign(ctx.state.user, _.pick(userInfo, ['nickName', 'avatarUrl', 'gender', 'location']));
    console.log(ctx.state.user);
    let user = await ctx.state.user.save();

    let userIndex = await srv_user.indexInfo(user._id);
    ctx.body = {
        success: 1,
        data: userIndex
    };
});


router.get('/user/index', auth.loginRequired, async (ctx, next) => {

    let userIndex = await srv_user.indexInfo(ctx.state.user._id);
    ctx.body = {
        success: 1,
        data: userIndex
    };
});

router.get('/user/friend/:uid', async (ctx, next) => {

    let friend = await User.findById(ctx.params.uid)
    ctx.body = {
        success: 1,
        data: friend.baseInfo()
    };
});


// 我的发布tobe migrate
/**
 * @api {get}   /user/mypublish   我的发布
 * @apiName     MyPublish
 * @apGroup     User
 *
 * @apiParam    {Number}  [isRemoved]   是否下架
 *
 */
router.get('/user/mypublish', auth.loginRequired, async (ctx, next) => {
    let isRemoved = parseInt(ctx.query.isRemoved) || 0;  //默认未下架
    let condi = {
        userID: ctx.state.user._id,
        deleted_date: null
    };  //未删除筛选
    condi.removed_date = null;
    if(isRemoved){
        condi.removed_date = {$ne: null};
    }
    console.log(condi);
    let goods = await Goods.find(condi).populate('gpics');
    ctx.body = {
        success: 1,
        data: await srv_goods.outputify(goods)
    }
});

/**
 * @api {get}   /user/:user_id/publish_list   发布列表
 * @apiName     UserPublish
 * @apGroup     User
 *
 *
 */
router.get('/user/:user_id/publish_list/', auth.loginRequired, async (ctx, next) => {


    let condi = {
        userID: ctx.params.user_id,
        status: {
            $in: [
                config.CONSTANT.GOODS_STATUS.RELEASED,
                config.CONSTANT.GOODS_STATUS.UNDERCARRIAGE
            ]
        },
        deleted_date: null,
        removed_date: null
    };  //未删除筛选

    console.log(condi);

    let pageNo = ctx.query.pageNo || 1;
    let pageSize = Math.min(ctx.query.pageSize || 20, 20); // 最大20，默认6
    let goods = await srv_goods.goodsListV2(ctx.state.user, pageNo, pageSize, condi);
    ctx.body = {
        success: 1,
        data: goods
    }
});





// 收藏
/**
 * @api {post}   /user/collect/:goods_id   收藏
 * @apiName     Collect
 * @apiGroup    User
 */
router.post('/user/collect/:goods_id', auth.loginRequired, async (ctx, next) => {
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
router.post('/user/uncollect/:goods_id', auth.loginRequired, async (ctx, next) => {
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


router.get('/user/wallet', auth.loginRequired, async (ctx, next) => {

    let user = ctx.state.user;

    let res = await srv_user.walletInfo(user._id);
    ctx.body = {
        success: 1,
        data: res
    }
});


/***
 * @api {post}   /user/save_formids/  上传formid
 * @apiName     SaveFormIds
 * @apiGroup    User
 *
 *
 * @apiParam    {Object}   formIds   formIds:{key:expire_time}
 */
router.post('/user/save_formids', auth.loginRequired, async(ctx, next)=>{
    let formIds = ctx.request.body.formIds;
    let total = await srv_user.pushFormIds(ctx.state.user._id, formIds);;
    console.log(formIds);
    ctx.body = {
        success:1,
        data: total
    }
})


/**
 * @api {get}   /user/collections   我的收藏
 * @apiName     Collections
 * @apiGroup    Center
 *
 *
 * @apiParam    {Number}    pageNo      当前页码，默认1
 * @apiParam    {Number}    pageSize    每页大小，默认6
 *
 * @apiSuccess  {Number}    success     1success
 * @apiSuccess  {Object}    data        列表
 *
 */
router.get('/user/collections', auth.loginRequired, async (ctx, next) => {
    let pageNo = ctx.query.pageNo || 1;
    let pageSize = Math.min(ctx.query.pageSize || 20, 20); // 最大20，默认6
    console.log(pageNo);
    console.log(pageSize);
    let user = ctx.state.user;
    let condi = {_id:user.collections};
    let goods = await srv_goods.goodsListV2(user, pageNo, pageSize, condi);

    ctx.body = {
        success: 1,
        data: goods
    };
});



