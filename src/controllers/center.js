
require('should');
let Router = require('koa-router');

let utils = require('utility');
let _ = require('lodash');

let config = require('../config');
let auth = require('../services/auth');
let srv_goods = require('../services/goods');
let srv_comment = require('../services/comment');
let srv_wechat = require('../services/wechat')
let { User } = require('../models');
let { Goods } = require('../models');

const router = module.exports = new Router();


/**
 * @api {get}   /center/moments   留言动态
 * @apiName     Moments
 * @apiGroup    Center
 *
 *
 * @apiSuccess  {Number}    success     1success
 * @apiSuccess  {Object}    data        列表
 *
 */
router.get('/center/moments', auth.loginRequired, async (ctx, next) => {
    let pageNo = ctx.query.pageNo || 1;
    let pageSize = Math.min(ctx.query.pageSize || 6, 20); // 最大20，默认6
    let moments = await srv_comment.momentList(ctx.state.user._id, pageSize, pageNo);
    ctx.body = {
        success: 1,
        data: moments
    };
});



// 所有收藏
// 分页参数为pageNo(默认为1), pageSize(默认为6)
// 返回值为 goods(list), hasMore(有下一页), total(记录总条数)

/**
 * @api {get}   /center/collections   我的收藏
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
router.get('/center/collections', auth.loginRequired, async (ctx, next) => {
    let pageNo = ctx.query.pageNo || 1;
    let pageSize = Math.min(ctx.query.pageSize || 6, 20); // 最大20，默认6
    console.log(pageNo);console.log(pageSize);

    let collections = await srv_goods.collectionList(ctx.state.user, pageNo, pageSize);

    ctx.body = {
        success: 1,
        data: collections
    };
});

/**
 * @api {get}   /center/unread   我的未读消息
 * @apiName     Unread
 * @apiGroup    Center
 *
 *
 *
 * @apiSuccess  {Number}    success     1success
 * @apiSuccess  {Object}    data        列表
 *
 */
router.get('/center/unread', auth.loginRequired, async (ctx, next) => {

    let unread = await srv_comment.unread(ctx.state.user._id);
    ctx.body = {
        success: 1,
        data: unread
    };
});

router.get('/center/banners', auth.loginRequired, async (ctx, next) => {

    // let unread = await srv_comment.unread(ctx.state.user._id);
    let bids = [
        "5ac86b6f76a65223294eb319",
        "5ad336e84f20d6431257e5b0"
    ];
    // let banner =

    ctx.body = {
        success: 1,
        data: data
    };
});


router.get('/center/test_update_service_account_user', async (ctx, next) => {
    let next_openid = ctx.query.next_openid;
    let res = await srv_wechat.update_service_account_userid(next_openid)
    ctx.body = {
        success: 1,
        data: res
    }
})