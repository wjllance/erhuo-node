
require('should');
let Router = require('koa-router');

let _ = require('lodash');
let mzfs = require('mz/fs');
let path = require('path');
let body = require('koa-convert')(require('koa-better-body')());

let config = require('../config');
let auth = require('../services/auth');
let { User, Image, Goods } = require('../models');

const router = module.exports = new Router();

// 首页，显示最新的6个
router.get('/goods/index', async (ctx, next) => {
    let goods = await Goods.find().sort('-_id').limit(6).populate('gpics');
    ctx.body = {
        success: 1,
        data: goods.map(x => x.toOBJ())
    }
});

// 发布
router.post('/goods/publish', auth.loginRequired, async (ctx, next) => {
    let images = await Image.find({_id: ctx.request.body.gpics});
    auth.assert(images.length == ctx.request.body.gpics.length, '图片不正确');

    for(let i = 0; i < images.length; i ++) {
        auth.assert(images[i].userID.equals(ctx.state.user._id), '图片所有者不正确');
    }

    let goods = new Goods();
    goods.userID = ctx.state.user._id;
    goods.gpics = images.map(x => x._id);
    _.assign(goods, _.pick(ctx.request.body, ['gname', 'gsummary', 'glabel', 'gprice', 'gstype', 'glocation', 'gcost', 'gcity']));
    await goods.save();

    ctx.body = {
        success: 1,
        data: goods._id.toString()
    };
});

router.get('/goods/detail/:id', async (ctx, next) => {
    let goods = await Goods.findById(ctx.params.id).populate('gpics');
    auth.assert(goods, '商品不存在');
    ctx.body = {
        success: 1,
        data: goods.toOBJ()
    };
});
