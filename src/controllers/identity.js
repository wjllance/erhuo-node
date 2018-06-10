require('should');
let Router = require('koa-router');

let _ = require('lodash');
let mzfs = require('mz/fs');
let path = require('path');
let body = require('koa-convert')(require('koa-better-body')());
let config = require('../config');
let auth = require('../services/auth');


let { User, Image, Identity} = require('../models');

const router = module.exports = new Router();



router.post('/identity/save', auth.loginRequired,async (ctx, next) => {
		let identity= new Identity();
		identity.userID=ctx.state.user._id;
		let cardimage= await Image.findById(ctx.request.body.cardpics);
		let withcardimage= await Image.findById(ctx.request.body.withcardpics);
		auth.assert(cardimage, "card image not found");
		auth.assert(withcardimage, "withcardimage image not found");

		_.assign(identity, _.pick(ctx.request.body, ['name','studentID','school']));
		identity.cardpics = cardimage._id;
		identity.withcardpics= withcardimage._id;

		await identity.save();
		ctx.body={
			success:1,
			data:identity._id
		}
});



/**
 * @api {post} 	/identity/save  上传认证资料
 * @apiName     GoodsList
 * @apiGroup    Goods
 *
 *
 * @apiParam    {String}    ncard      		学生证图片id
 * @apiParam    {String}    nwithcard    	手持身份证图片id
 * @apiParam    {String}    name    		姓名
 * @apiParam    {String}    studentID       学号
 * @apiParam    {String}    school    		学校
 *
 * @apiSuccess  {Number}    success     1success
 * @apiSuccess  {Object}    data        分页商品列表
 *
 */
router.post('/v2/identity/save', auth.loginRequired,async (ctx, next) => {
	let params = ctx.request.body;
	auth.assert(params.name && params.studentID && params.school && params.ncard && params.nwithcard, "缺少参数");

    let identity= new Identity();
    identity.userID=ctx.state.user._id;

    _.assign(identity, _.pick(ctx.request.body, ['name','studentID','school', 'ncard', 'nwithcard']));
    await identity.save();
    ctx.body={
        success:1,
        data:identity._id
    }
});

router.get('/identity/info', auth.loginRequired,async (ctx, next) => {
    let identity= await Identity.findOne({userID:ctx.state.user._id}).sort({created_date:-1});
    auth.assert(identity, "没有审核资料");
    ctx.body={
        success:1,
        data:identity
    }
});