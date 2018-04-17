
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
const schools = config.CONSTANT.SCHOOL

// 首页, 参数为pageNo(默认为1), pageSize(默认为6)
// 返回值为 goods(list), hasMore(有下一页), totle(记录总条数)

/**
 * @api {get} /goods/index  商品列表
 * @apiName     GoodsList
 * @apiGroup    Goods
 *
 *
 * @apiParam    {Number}    pageNo      当前页码，默认1
 * @apiParam    {Number}    pageSize    每页大小，默认6
 *
 * @apiSuccess  {Number}    success     1success
 * @apiSuccess  {Object}    data        分页商品列表
 * @apiSuccess  {Array}     data.goods  商品列表
 * @apiSuccess  {Boolean}     data.hasMore  还有更多
 * @apiSuccess  {Number}     data.total  总数
 *
 */
router.get('/goods/index', async (ctx, next) => {
    // let condi= {
    //     $or: [
    //         {removed_date: null}, {removed_date:{$gt:Date.now()}}  //加入未下架筛选
    //     ]
    // };
    // await auth.loginRequired(ctx, next)
    let pageNo = ctx.query.pageNo || 1;
    let pageSize = Math.min(ctx.query.pageSize || 6, 20); // 最大20，默认6

    let data = await srv_goods.goodsList(ctx.state.user, pageNo, pageSize);
    ctx.body = {
        success: 1,
        data: data
    }
});

// 发布
/**
 * @api {post} /goods/publish  发布商品
 * @apiName     GoodsPublish
 * @apiGroup    Goods
 *
 *
 * @apiParam    {Array}     gpics    图片id列表
 * @apiParam    {String}    gname
 * @apiParam    {String}    glabel
 * @apiParam    {Number}    gprice
 * @apiParam    {String}    gstype
 * @apiParam    {String}    glocation
 * @apiParam    {Number}    gcost
 * @apiParam    {Number}    gcity
 *
 * @apiSuccess  {Number}    success     1success
 * @apiSuccess  {Object}    data        goods_id
 *
 */
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

    if(!goods.glocation){
        goods.glocation = ctx.state.user.location || schools.ALL;
    }
    await goods.save();

    ctx.body = {
        success: 1,
        data: goods._id.toString()
    };
});


// 下架
// 参数：gid

/**
 * @api {put} /goods/remove/:goods_id  商品下架
 * @apiName     GoodsDelete
 * @apiGroup    Goods
 *
 * @apiSuccess  {Number}    success
 * @apiSuccess  {Object}    data
 *
 */
router.put('/goods/remove/:goods_id', auth.loginRequired, async (ctx, next) => {
    let myGood = await Goods.findOne({_id: ctx.params.goods_id});
    auth.assert(myGood, '商品不存在');
    let isRemoved = await srv_goods.isGoodRemoved(myGood);
    auth.assert(!isRemoved, '商品已下架');
    auth.assert(myGood.userID.equals(ctx.state.user._id), '只有所有者才有权限下架商品');
    _.assign(myGood, {'removed_date':Date.now()});
    console.log(myGood);
    await myGood.save();
    ctx.body = {
        success: 1,
        data: myGood._id.toString()
    };
});


// 删除
// 参数：gid

/**
 * @api {delete} /goods/:goods_id  商品删除
 * @apiName     GoodsDelete
 * @apiGroup    Goods
 *
 * @apiSuccess  {Number}    success
 * @apiSuccess  {Object}    data
 *
 */
router.delete('/goods/:goods_id', auth.loginRequired, async (ctx, next) => {
    let myGood = await Goods.findOne({_id: ctx.params.goods_id});
    auth.assert(myGood, '商品不存在');
    let isRemoved = await srv_goods.isGoodRemoved(myGood);
    auth.assert(isRemoved, '商品未下架，不能删除');
    auth.assert(myGood.userID.equals(ctx.state.user._id), '只有所有者才有权限删除商品');
    _.assign(myGood, {'deleted_date':Date.now()});
    console.log(myGood);
    await myGood.save();
    ctx.body = {
        success: 1,
        data: myGood._id.toString()
    };
});

/**
 * @api {put} /goods/:goods_id  编辑商品
 * @apiName     GoodsEdit   暂不支持修改图片
 * @apiGroup    Goods
 *
 * @apiParam    {String}    gname
 * @apiParam    {String}    glabel
 * @apiParam    {Number}    gprice
 * @apiParam    {String}    gstype
 * @apiParam    {String}    glocation
 * @apiParam    {Number}    gcost
 * @apiParam    {Number}    gcity
 *
 * @apiSuccess  {Number}    success
 * @apiSuccess  {Object}    data
 *
 */
router.put('/goods/:goods_id', auth.loginRequired, async (ctx, next) => {
    let goods = await srv_goods.getBaseById(ctx.params.goods_id);
    auth.assert(goods, '商品不存在');
    auth.assert(goods.userID.equals(ctx.state.user._id), '无权限');
    _.assign(goods, _.pick(ctx.request.body, ['gname', 'gsummary', 'glabel', 'gprice', 'gstype', 'glocation', 'gcost', 'gcity']));
    goods.updated_date = Date.now();
    await goods.save();

    ctx.body = {
        success: 1,
        data: await srv_goods.getDetailById(ctx.params.goods_id, ctx.state.user)
    };
});

/**
 * @api {get} /goods/detail/:goods_id  获取商品详情
 * @apiName     GetGoodsDetail
 * @apiGroup    Goods
 *
 * @apiSuccess  {Number}    success
 * @apiSuccess  {Object}    data
 *
 */
router.get('/goods/detail/:goods_id', async (ctx, next) => {
    let goods = await srv_goods.getDetailById(ctx.params.goods_id, ctx.state.user);
    auth.assert(goods, '商品不存在');
    // auth.assert(!isRemoved, '商品已下架');
    ctx.body = {
        success: 1,
        data: goods
    };
});



/**
 * @api {get} /goods/base/:goods_id  获取商品基本信息
 * @apiName     GetGoodsBaseInfo
 * @apiGroup    Goods
 *
 * @apiSuccess  {Number}    success
 * @apiSuccess  {Object}    data
 *
 */
router.get('/goods/base/:goods_id', async (ctx, next) => {
    let goods = await srv_goods.getCardInfoById(ctx.params.goods_id);
    auth.assert(goods, '商品不存在');
    let g = _.pick(goods, ['_id', 'gname', 'gsummary', 'glabel', 'gprice', 'gstype', 'glocation', 'gcost', 'gcity']);
    g.gpics = goods.gpics.map(y=>y.urlwithid());

    ctx.body = {
        success: 1,
        data: g
    };
});
