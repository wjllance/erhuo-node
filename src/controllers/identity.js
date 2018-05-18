require('should');
let Router = require('koa-router');

let _ = require('lodash');
let mzfs = require('mz/fs');
let path = require('path');
let body = require('koa-convert')(require('koa-better-body')());
let config = require('../config');
let auth = require('../services/auth');


let { User, Image, Identity} = require('../models');



router.post('/Identity/save', auth.loginRequired,async (ctx, next) => {
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