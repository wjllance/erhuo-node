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



/**
 * @api {get} /identity/save  商品列表
 * @apiName     GoodsList
 * @apiGroup    Goods
 *
 *
 * @apiParam    {Number}    cardpics      	学生证
 * @apiParam    {Number}    withcardpics    手持身份证
 * @apiParam    {Number}    name    		姓名
 * @apiParam    {Number}    studentID       学号
 * @apiParam    {Number}    school    		学校
 *
 * @apiSuccess  {Number}    success     1success
 * @apiSuccess  {Object}    data        分页商品列表
 * @apiSuccess  {Array}     data.goods  商品列表
 * @apiSuccess  {Boolean}   data.hasMore  还有更多
 * @apiSuccess  {Number}    data.total  总数
 *
 */
router.post('/identity/save', auth.loginRequired,async (ctx, next) => {
		let identity= new Identity();
		identity.userID=ctx.state.user._id;
		let cardimage= await Image.findById(ctx.request.body.cardpics);
		let withcardimage= await Image.findById(ctx.request.body.withcardpics);
		auth.assert(cardimage, "card image not found");
		auth.assert(withcardimage, "withcardimage image not found");

		_.assign(identity, _.pick(ctx.request.body, ['name','studentID','school']));
		identity.cardpics = cardimage._id;
		identity.withcardpics=withcardimage._id;

		await identity.save();
		ctx.body={
			success:1,
			data:identity._id
		}
});