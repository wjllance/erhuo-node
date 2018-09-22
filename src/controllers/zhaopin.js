require("should");
let Router = require("koa-router");

let _ = require("lodash");
let mzfs = require("mz/fs");
let path = require("path");
let body = require("koa-convert")(require("koa-better-body")());
let config = require("../config");
let auth = require("../services/auth");


let { Zhaopin } = require("../models");

const router = module.exports = new Router();


/**
 * @api {post}    /zhaopin/save  应聘申请
 * @apiName     zhaopinsave
 * @apiGroup    zhaopin
 *
 *
 *
 * @apiParam    {String}    name            学生姓名
 * @apiParam    {String}    tel             电话号码
 * @apiParam    {String}    school           所属学校
 * @apiParam    {String}    grade             年级
 * @apiParam    {String}    profession        专业
 *
 * @apiParam  {Number}    [IsDurable]       是否坐班
 * @apiParam  {Number}    [IsUnderstand]       是否需要深入了解
 *
 * @apiSuccess  {Number}    zhaopin._id        创建的id
 */

router.post("/v2/zhaopin/save", auth.loginRequired, async (ctx, next) => {
    let params = ctx.request.body;
    auth.assert(params.name && params.tel && params.school && params.grade && params.profession&&params.preference, "缺少参数");

    let zhaopin = await Zhaopin.findOne({ userID: ctx.state.user._id });
    if (!zhaopin) {
        zhaopin = new Zhaopin({
            userID: ctx.state.user._id,
        });
    }

    _.assign(zhaopin, _.pick(ctx.request.body, ["name", "tel", "school", "grade", "profession", "IsDurable", "IsUnderstand","preference"]));
    await zhaopin.save();
    ctx.body = {
        success: 1,
        data: zhaopin._id,
    };
});
router.get("/zhaopin/info", auth.loginRequired, async (ctx, next) => {
    let zhaopin = await Zhaopin.findOne({ userID: ctx.state.user._id }).sort({ created_date: -1 });
    let ret = zhaopin || null;
    ctx.body = {
        success: 1,
        data: ret,
    };
});