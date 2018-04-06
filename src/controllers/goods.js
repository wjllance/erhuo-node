
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
    let totle = await Goods.count();//表总记录数
    let reqParam= ctx.query;
    let pageNo = 1;
    if (reqParam.pageNo) {pageNo = Number(reqParam.pageNo);}  //页码数, 默认为1
    let pageSize = 6;
    if (reqParam.pageSize) {pageSize = Number(reqParam.pageSize);}//每页显示的记录条数, 默认为6
    let goods = await Goods.find().sort('-_id').limit(pageSize).skip((pageNo-1)*pageSize).populate('gpics');
    let hasMore=totle-pageNo*pageSize>0;
    ctx.response.type = 'application/json';
    ctx.body = {
        success: 1,
        data: {
            goods: await srv_goods.outputify(goods, ctx.state.user),
            hasMore:hasMore,
            total:totle
        }
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
    await goods.save();

    ctx.body = {
        success: 1,
        data: goods._id.toString()
    };
});


// 下架
// 参数：gid

/**
 * @api {delete} /goods/:goods_id  商品下架
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
    auth.assert(myGood.userID.equals(ctx.state.user._id), '只有所有者才有权限下架商品');
    _.assign(myGood, {'removed_date':Date.now()});
    console.log(myGood);
    await myGood.save();
    ctx.body = {
        success: 1,
        data: myGood._id.toString()
    };
});

/**
 * @api {put} /goods/:goods_id  编辑商品
 * @apiName     GoodsEdit
 * @apiGroup    Goods
 *
 * @apiSuccess  {Number}    success
 * @apiSuccess  {Object}    data
 *
 */
router.put('/goods/:goods_id', auth.loginRequired, async (ctx, next) => {

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
    let goods = await srv_goods.getDetailById(ctx.params.goods_id);
    auth.assert(goods, '商品不存在');
    ctx.body = {
        success: 1,
        data: goods
    };
});

