
require('should');
let Router = require('koa-router');

let utils = require('utility');
let _ = require('lodash');

let config = require('../config');
let auth = require('../services/auth');
let srv_goods = require('../services/goods');
let srv_comment = require('../services/comment');
let { User } = require('../models');
let { Goods } = require('../models');

const router = module.exports = new Router();


/**
 * @api {get}   /center/leave_message   留言列表
 * @apiName     LeaveMessage
 * @apiGroup    Center
 *
 *
 * @apiSuccess  {Number}    success     1success
 * @apiSuccess  {Object}    data        列表
 *
 */
router.get('/center/leave_message', auth.loginRequired, async (ctx, next) => {
    let comments = await srv_comment.myCommentList(ctx.state.user._id);
    ctx.body = {
        success: 1,
        data: comments
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