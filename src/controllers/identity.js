require("should");
let Router = require("koa-router");

let _ = require("lodash");
let body = require("koa-convert")(require("koa-better-body")());
let config = require("../config");
let auth = require("../services/auth");
let identityService = require('../services/identity');
let wechatService = require('../services/wechat');

let { User, Image, Identity } = require("../models");

const router = module.exports = new Router();


/**
 * @api {post}    /identity/save  上传认证资料
 * @apiName     upload
 * @apiGroup    identity
 *
 *
 * @apiParam    {String}    ncard            学生证图片id
 * @apiParam    {String}    nwithcard        手持身份证图片id
 * @apiParam    {String}    name            姓名
 * @apiParam    {String}    studentID       学号
 * @apiParam    {String}    school            学校
 *
 * @apiSuccess  {Number}    success     1success
 * @apiSuccess  {Object}    data        分页商品列表
 *
 */
router.post("/v2/identity/save", auth.loginRequired, async (ctx, next) => {
    let params = ctx.request.body;
    auth.assert(params.name && params.studentID && params.school && params.ncard && params.nwithcard, "缺少参数");

    let identity = await Identity.findOne({ userID: ctx.state.user._id });
    if (!identity) {
        identity = new Identity({
            userID: ctx.state.user._id,
        });
    }

    _.assign(identity, _.pick(ctx.request.body, ["name", "studentID", "school", "ncard", "nwithcard"]));
    identity.updated_date = Date.now();
    await identity.save();

    //加入 提醒通知
    let user = await User.findOne({ _id: ctx.state.user._id });
    console.log(user._id);
    let res = await wechatService.sendReplyNotice2(user, "0");
    ctx.body = {
        success: 1,
        data: identity._id,
    };
});
/**
 * @api {get}    /identity/detail  获取单个用户的认证详情
 * @apiName     detail
 * @apiGroup    identity
 *
 *
 * @apiParam    {String}    user_id     用户id
 *
 * @apiSuccess  {Number}    success     1success
 * @apiSuccess  {Object}    data        用户的详情信息
 *
 */
router.get("/identity/detail", auth.adminRequired, async (ctx, next) => {

    let identity = await Identity.findOne({ userID: ctx.query.user_id }).sort({ created_date: -1 });
    auth.assert(identity, "未申请审核");
    let user = await User.findById(ctx.query.user_id);
    let ret = {
        user,
        identity
    };
    ctx.body = {
        success: 1,
        data: ret,
    };
});

router.get("/identity/info", auth.loginRequired, async (ctx, next) => {
    let identity = await Identity.findOne({ userID: ctx.state.user._id }).sort({ created_date: -1 });
    let ret = identity || null;
    ctx.body = {
        success: 1,
        data: ret,
    };
});

/**
 * @api {get}    /identity/list  上获取认证列表
 * @apiName     userList
 * @apiGroup    identity
 *
 *
 *
 * @apiParam    {Number}    pageNo      当前页码，默认1
 * @apiParam    {Number}    pageSize    每页大小，默认6
 *
 * @apiSuccess  {Number}    success     1success
 * @apiSuccess  {Object}    data        分页认证列表
 *
 */
router.get("/identity/list", auth.adminRequired, async (ctx, next) => {

    let pageNo = ctx.query.pageNo || 1;
    let pageSize = Math.min(ctx.query.pageSize || 6, 20); // 最大20，默认6

    let identitys = await identityService.userList(pageNo, pageSize);
    // console.log(identitys);
    ctx.body = {
        success: 1,
        data: identitys,
    };
});