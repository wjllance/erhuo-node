require("should");
let Router = require("koa-router");

let _ = require("lodash");
let mzfs = require("mz/fs");
let path = require("path");
let body = require("koa-convert")(require("koa-better-body")());
let config = require("../config");
let auth = require("../services/auth");
let identityService = require('../services/identity');


let { User, Image, Identity } = require("../models");

const router = module.exports = new Router();


/**
 * @api {post}    /identity/save  上传认证资料
 * @apiName     GoodsList
 * @apiGroup    Goods
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
    await identity.save();
    ctx.body = {
        success: 1,
        data: identity._id,
    };
});
/**
 * @api {get}    /identity/userInfoDetail  获取单个用户的认证详情
 * @apiName     userList
 * @apiGroup    identity
 *
 *
 *
 * @apiSuccess  {Number}    success     1success
 * @apiSuccess  {Object}    data        用户的详情信息
 *
 */
router.get("/identity/userInfoDetail", auth.loginRequired, async (ctx, next) => {
    let identity = await Identity.findOne({ userID: ctx.state.user._id });
    let ret = identity || null;
    ctx.body = {
        success: 1,
        data: ret,
    };
});
/**
 * @api {get}    /identity/userlist  上获取认证列表
 * @apiName     userList
 * @apiGroup    identity
 *
 *
 *
 * @apiSuccess  {Number}    success     1success
 * @apiSuccess  {Object}    data        分页认证列表
 *
 */
router.get("/identity/userlist", auth.loginRequired, async (ctx, next) => {


    let pageNo = ctx.query.pageNo || 1;
    let pageSize = Math.min(ctx.query.pageSize || 6, 20); // 最大20，默认6

    let identitys = await identityService.userList(pageNo,pageSize);
     console.log(identitys);
    ctx.body = {
        success: 1,
        data: identitys,
    };
});