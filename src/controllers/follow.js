require('should');
let Router = require('koa-router');

let _ = require('lodash');
let body = require('koa-convert')(require('koa-better-body')());

let moment = require('moment');
moment.locale('zh-cn');
let auth = require('../services/auth');
let { Follow, User } = require('../models');
let srv_follow = require('../services/follow');

const router = module.exports = new Router();

/**
 * @api {post}  /follow/on   关注
 * @apiName     Follow
 * @apiGroup    Follow
 *
 * @apiParam    {String}    toId    被关注用户id
 *
 *
 */
router.post('/follow/on', auth.loginRequired, async (ctx, next) => {

    auth.assert(ctx.request.body.toId, "被关注用户无效");
    let params = {
        fromId: ctx.state.user._id,
        toId: ctx.request.body.toId,
    };
    let follow = await Follow.findOne(params);
    auth.assert(!follow || follow.canceled_date, "已经关注该用户");


    let res = await Follow.findOneAndUpdate(params, {
        canceled_date: null,
        updated_date: Date.now()
    }, {new:true, upsert:true});

    console.log(res);
    ctx.body = {
        success: 1,
        msg: "关注成功",
        data: res._id.toString(),
    };
});


/**
 * @api {post}  /follow/off   取消关注
 * @apiName     Unfollow
 * @apiGroup    Follow
 *
 * @apiParam    {String}    toId     被取消用户id
 *
 *
 */
router.post('/follow/off', auth.loginRequired, async (ctx, next) => {

    auth.assert(ctx.request.body.toId, "取消关注用户无效");
    let follow = await Follow.findOne({
        fromId: ctx.state.user._id,
        toId: ctx.request.body.toId,
    });

    auth.assert(follow && !follow.canceled_date, "未关注该用户");

    follow.canceled_date = Date.now();
    follow.updated_date = Date.now();
    await follow.save();

    ctx.body = {
        success: 1,
        msg: "取关成功",
    };
});


/**
 * @api {get}   /follow/follower 关注他的
 * @apiName     FollowerList
 * @apiGroup    Follow
 *
 *
 * @apiParam    {Number}    pageNo      当前页码，默认1
 * @apiParam    {Number}    pageSize    每页大小，默认6
 * @apiParam    {String}    [user_id]     用户id
 *
 *
 * @apiSuccess  {Number}    success     1success
 * @apiSuccess  {Object}    data        列表
 *
 */
//粉丝
router.get('/follow/follower', auth.loginRequired, async (ctx, next) => {
    let pageNo = ctx.query.pageNo || 1;
    let pageSize = Math.min(ctx.query.pageSize || 20, 20); // 最大20，默认6

    let me = ctx.state.user;
    let user = me;
    if(ctx.query.user_id){
        user = await User.findById(ctx.query.user_id);
    }

    let res = await srv_follow.followerList(me, pageNo, pageSize, user);

    ctx.body = {
        success: 1,
        data: res
    };
});


/**
 * @api {get}   /follow/concerned 他关注的
 * @apiName     concernedList
 * @apiGroup    Follow
 *
 *
 * @apiParam    {Number}    pageNo      当前页码，默认1
 * @apiParam    {Number}    pageSize    每页大小，默认6
 * @apiParam    {String}    [user_id]     用户id
 *
 *
 * @apiSuccess  {Number}    success     1success
 * @apiSuccess  {Object}    data        列表
 *
 */
//关注的人
router.get('/follow/concerned', auth.loginRequired, async (ctx, next) => {
    let pageNo = ctx.query.pageNo || 1;
    let pageSize = Math.min(ctx.query.pageSize || 20, 20); // 最大20，默认6

    let me = ctx.state.user;
    let user = me;
    if(ctx.query.user_id){
        user = await User.findById(ctx.query.user_id);
    }
    let res = await srv_follow.concernedList(me, pageNo, pageSize, user);

    ctx.body = {
        success: 1,
        data: res
    };
});