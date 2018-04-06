
require('should');
let Router = require('koa-router');

let _ = require('lodash');
let mzfs = require('mz/fs');
let path = require('path');
let body = require('koa-convert')(require('koa-better-body')());

let config = require('../config');
let auth = require('../services/auth');
let srv_goods = require('../services/goods');
let { User, Image, Goods } = require('../models');

const router = module.exports = new Router();

// 首页, 参数为pageNo(默认为1), pageSize(默认为6)
// 返回值为 hasMore(有下一页), totle(记录总条数)
router.get('/goods/index', async (ctx, next) => {
    let totle = await Goods.count();//表总记录数
    let reqParam= ctx.query;
    let pageNo = 1;
    if (reqParam.pageNo) {pageNo = Number(reqParam.pageNo);}  //页码数, 默认为1
    let pageSize = 6;
    if (reqParam.pageSize) {pageSize = Number(reqParam.pageSize);}//每页显示的记录条数, 默认为6
    console.log(pageNo);console.log(pageSize);
    let goods = await Goods.find().sort('-_id').limit(pageSize).skip((pageNo-1)*pageSize).populate('gpics');
    let hasMore=totle-pageNo*pageSize>0;
    ctx.response.type = 'application/json';
    ctx.body = {
        success: 1,
        data: await srv_goods.outputify(goods, ctx.state.user),
        hasMore:hasMore,
        totle:totle
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

router.get('/goods/detail/:goods_id', async (ctx, next) => {
    let goods = await Goods.findById(ctx.params.goods_id).populate('gpics');
    auth.assert(goods, '商品不存在');
    ctx.body = {
        success: 1,
        data: await srv_goods.outputify(goods, ctx.state.user)
    };
});
