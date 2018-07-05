
require('should');
let Router = require('koa-router');

let _ = require('lodash');
let mzfs = require('mz/fs');
let path = require('path');
let body = require('koa-convert')(require('koa-better-body')());
let moment = require('moment');
moment.locale('zh-cn');
let config = require('../config');
let auth = require('../services/auth');
let srv_goods = require('../services/goods');
let srv_order = require('../services/order');
let { User, Image, Goods } = require('../models');

const router = module.exports = new Router();
const GOODS_STATUS = config.CONSTANT.GOODS_STATUS;

// 首页, 参数为pageNo(默认为1), pageSize(默认为6)
// 返回值为 goods(list), hasMore(有下一页), totle(记录总条数)

/**
 * deprecated
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

    let pageNo = ctx.query.pageNo || 1;
    let pageSize = Math.min(ctx.query.pageSize || 6, 20); // 最大20，默认6

    let data = await srv_goods.goodsList(ctx.state.user, pageNo, pageSize);
    ctx.body = {
        success: 1,
        data: data
    }
});


/**
 * @api {get} /v2/goods/index  商品列表
 * @apiName     GoodsList
 * @apiGroup    Goods
 *
 *
 * @apiParam    {Number}    pageNo      当前页码，默认1
 * @apiParam    {Number}    pageSize    每页大小，默认6
 * @apiParam    {String}    category    列表类别 ["美妆","女装","女鞋","配饰","包包","日用","其他"]
 *
 * @apiSuccess  {Number}    success     1success
 * @apiSuccess  {Object}    data        分页商品列表
 * @apiSuccess  {Array}     data.goods  商品列表
 * @apiSuccess  {Boolean}     data.hasMore  还有更多
 * @apiSuccess  {Number}     data.total  总数
 *
 */
router.get('/v2/goods/index', async (ctx, next) => {
    // let condi= {
    //     $or: [
    //         {removed_date: null}, {removed_date:{$gt:Date.now()}}  //加入未下架筛选
    //     ]
    // };
    // await auth.loginRequired(ctx, next)
    let pageNo = ctx.query.pageNo || 1;
    let pageSize = Math.min(ctx.query.pageSize || 12, 20); // 最大20，默认6

    let cate = ctx.query.category;
    let condi = {
        deleted_date:null
    };
    let sorti = {};
    if(!cate)
    {
        cate = "推荐";
    }

    console.log(cate);
    if(cate === "推荐"){
        sorti = {
            gpriority:-1,
            // removed_date:1,
            glocation: -1,
            updated_date:-1
        }
    }
    else if(cate === "今日"){
        condi.created_date = {
            $gt: moment().subtract(1, 'd')
        };
        sorti = {
            gpriority:-1,
            // removed_date:1,
            glocation: -1,
            updated_date:-1
        }
        console.log(condi, sorti);
    }
    else if(srv_goods.CATES.indexOf(cate) !== -1){
        condi.category = cate;
        sorti = {
            // gpriority:-1,
            removed_date:1,
            glocation: -1,
            updated_date:-1
        }
    }
    let user = ctx.state.user;
    if(user){ //not other
        condi.$or=[{
            glocation:user.location
        },{
            glocation:0
        }]
    }

    console.log(condi, sorti);
    let data = await srv_goods.goodsListV2(user, pageNo, pageSize, condi, sorti);
    ctx.body = {
        success: 1,
        data: data
    }
});

//加入审核状态
router.get('/v3/goods/index', async (ctx, next) => {
    let pageNo = ctx.query.pageNo || 1;
    let pageSize = Math.min(ctx.query.pageSize || 12, 20); // 最大20，默认6

    let cate = ctx.query.category;
    let condi = {
        deleted_date:null,
        status: {
            $in: [
                GOODS_STATUS.RELEASED,
                GOODS_STATUS.UNDERCARRIAGE
            ]
        }
    };
    let sorti = {};
    if(!cate)
    {
        cate = "推荐";
    }

    console.log(cate);
    if(cate === "推荐"){
        sorti = {
            gpriority:-1,
            // removed_date:1,
            glocation: -1,
            updated_date:-1
        }
    }
    else if(cate === "今日"){
        let ddl = moment({hour:20}).subtract(1,'d');
        if(moment().isBefore(moment({hour:20}))){
            ddl = ddl.subtract(1,'d');
        }
        condi.created_date = {
            // $gt: moment().subtract(1, 'd')
            $gt: ddl
        };
        sorti = {
            gpriority:-1,
            // removed_date:1,
            glocation: -1,
            updated_date:-1
        }
        console.log(condi, sorti);
    }
    else if(srv_goods.CATES.indexOf(cate) !== -1){
        condi.category = cate;
        sorti = {
            // gpriority:-1,
            removed_date:1,
            glocation: -1,
            updated_date:-1
        }
    }
    let user = ctx.state.user;
    if(user){ //not other
        condi.$or=[{
            glocation:user.location
        },{
            glocation:0
        }]
    }

    console.log(condi, sorti);
    let data = await srv_goods.goodsListV2(user, pageNo, pageSize, condi, sorti);
    ctx.body = {
        success: 1,
        data: data
    }
});


/**
 * @api {get} /goods/search  商品搜索
 * @apiName     GoodsSearch
 * @apiGroup    Goods
 *
 *
 * @apiParam    {Number}    pageNo      当前页码，默认1
 * @apiParam    {Number}    pageSize    每页大小，默认6
 * @apiParam    {String}    keyword     关键词
 *
 * @apiSuccess  {Number}    success     1success
 * @apiSuccess  {Object}    data        分页商品列表
 * @apiSuccess  {Array}     data.goods  商品列表
 * @apiSuccess  {Boolean}     data.hasMore  还有更多
 * @apiSuccess  {Number}     data.total  总数
 *
 */
router.get('/goods/search', async (ctx, next) => {
    await auth.loginRequired(ctx, next);

    let pageNo = ctx.query.pageNo || 1;
    let pageSize = Math.min(ctx.query.pageSize || 12, 20); // 最大20，默认6

    let keyword = ctx.query.keyword;
    let reg = new RegExp(keyword, 'i');

    let condi = {$and:[]}; //审核
    condi.$and.push({
        $or:[
            {gname: reg},
            {gsummary: reg}
        ]
    });

    let sorti = {
        gpriority:-1,
        // removed_date:1,
        glocation: -1,
        updated_date:-1
    };
    let user = ctx.state.user;
    if(user){ //not other
        condi.$and.push({
            $or:[
                {glocation:user.location},
                {glocation:0}
            ]
        });
    }
    console.log(JSON.stringify(condi.$and), sorti);
    let data = await srv_goods.goodsListV2(user, pageNo, pageSize, condi, sorti);
    ctx.body = {
        success: 1,
        data: data
    }
});


/**
 * @api {get}   /goods/hot_words  热搜词
 * @apiName     GoodsHotWords
 * @apiGroup    Goods
 *
 *
 * @apiSuccess  {Number}    success     1success
 * @apiSuccess  {Object}    data        分页商品列表
 * @apiSuccess  {Array}     data.goods  商品列表
 * @apiSuccess  {Boolean}     data.hasMore  还有更多
 * @apiSuccess  {Number}     data.total  总数
 *
 */

router.get('/goods/hot_words', async (ctx, next) => {

    let data = ["面膜","防晒","唇膏", "眉笔"];

    ctx.body = {
        success: 1,
        data: data
    }
});

// 发布
/**
 * @api {post} /v2/goods/publish  发布商品
 * @apiName     GoodsPublish
 * @apiGroup    Goods
 *
 *
 * @apiParam    {Array}     [gpics]    图片id列表
 * @apiParam    {Array}     npics    图片id列表
 * @apiParam    {String}    gname
 * @apiParam    {String}    gsummary
 * @apiParam    {String}    glabel
 * @apiParam    {Number}    gprice
 * @apiParam    {String}    gstype
 * @apiParam    {String}    glocation
 * @apiParam    {Number}    gcost
 * @apiParam    {Number}    gcity
 * @apiParam    {String}    category
 *
 * @apiSuccess  {Number}    success     1success
 * @apiSuccess  {Object}    data        goods_id
 *
 */
router.post('/goods/publish', auth.loginRequired, async (ctx, next) => {
    let images = await Image.find({_id: ctx.request.body.gpics});
    auth.assert(images.length === ctx.request.body.gpics.length, '图片不正确');

    for(let i = 0; i < images.length; i ++) {
        auth.assert(images[i].userID.equals(ctx.state.user._id), '图片所有者不正确');
    }

    let goods = new Goods();
    goods.userID = ctx.state.user._id;
    goods.gpics = images.map(x => x._id);
    _.assign(goods, _.pick(ctx.request.body, ['gname', 'gsummary', 'glabel', 'gprice', 'gstype', 'glocation', 'gcost', 'gcity', 'category', 'remark']));

    if(!goods.glocation){
        goods.glocation = ctx.state.user.location || 0;
    }
    await goods.save();

    ctx.body = {
        success: 1,
        data: goods._id.toString()
    };
});


router.post('/v2/goods/publish', auth.loginRequired, async (ctx, next) => {

    let params = ctx.request.body;
    auth.assert(params.gsummary && params.gprice, "缺少参数");
    auth.assert(params.npics && params.npics.length > 0, "没图");

    let goods = new Goods();
    goods.userID = ctx.state.user._id;
    // goods.gpics = images.map(x => x._id);

    _.assign(goods, _.pick(params, ['gname', 'gsummary', 'glabel', 'gprice', 'npics', 'gstype', 'glocation', 'gcost', 'gcity', 'remark']));

    goods.category = params.category || "其他";
    goods.gname = params.gname || params.gsummary.substr(0, 20);
    if(!goods.glocation){
        goods.glocation = ctx.state.user.location || 0;
    }
    await goods.save();

    ctx.body = {
        success: 1,
        data: goods._id
    };
});


// 下架
// 参数：gid

/**
 * @api {post} /goods/remove/:goods_id  商品下架
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
    // let isRemoved = await srv_goods.isGoodRemoved(myGood);
    auth.assert(!myGood.removed_date, '商品已下架');
    auth.assert(myGood.userID.equals(ctx.state.user._id), '只有所有者才有权限下架商品');

    await myGood.myRemove();

    // _.assign(myGood, {'removed_date':Date.now()});
    // console.log(myGood);
    // await myGood.save();
    ctx.body = {
        success: 1,
        data: myGood._id.toString()
    };
});

router.post('/goods/remove/', auth.loginRequired, async (ctx, next) => {
    let myGood = await Goods.findById(ctx.request.body.goodsId);
    auth.assert(myGood, '商品不存在');
    auth.assert(!myGood.removed_date, '商品已下架');
    auth.assert(myGood.userID.equals(ctx.state.user._id), '只有所有者才有权限下架商品');
    await myGood.myRemove();
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
    auth.assert(false, "暂时不能删除商品");



    auth.assert(myGood, '商品不存在');
    let isRemoved = srv_goods.isGoodRemoved(myGood);
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
 * @apiName     GoodsEdit
 * @apiGroup    Goods
 *
 * @apiParam    {String}    gname
 * @apiParam    {String}    gsummary
 * @apiParam    {String}    glabel
 * @apiParam    {Number}    gprice
 * @apiParam    {Number}    gcost
 * @apiParam    {Array}     gpics    图片id列表
 *
 * @apiSuccess  {Number}    success
 * @apiSuccess  {Object}    data
 *
 */
router.put('/goods/:goods_id', auth.loginRequired, async (ctx, next) => {
    let goods = await Goods.findById(ctx.params.goods_id);
    auth.assert(goods, '商品不存在');
    auth.assert(goods.userID.equals(ctx.state.user._id), '无权限');

    if(ctx.request.body.gpics){
        let images = await Image.find({_id: ctx.request.body.gpics});
        auth.assert(images.length == ctx.request.body.gpics.length, '图片不正确');

        for(let i = 0; i < images.length; i ++) {
            auth.assert(images[i].userID.equals(ctx.state.user._id), '图片所有者不正确');
        }

        goods.gpics = images.map(x => x._id);
    }

    _.assign(goods, _.pick(ctx.request.body, ['gname', 'gsummary', 'glabel', 'gprice', 'gcost']));
    goods.updated_date = Date.now();
    await goods.save();

    ctx.body = {
        success: 1,
        // data: await srv_goods.getDetailById(ctx.params.goods_id, ctx.state.user)
        data: await srv_goods.getDetailByIdV2(ctx.params.goods_id, ctx.state.user)
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
router.get('/v2/goods/detail/:goods_id', async (ctx, next) => {
    let goods = await srv_goods.getDetailByIdV2(ctx.params.goods_id, ctx.state.user);
    // auth.assert(goods, '商品不存在');

    goods.trading_status = await srv_order.tradingStatus(goods);
    // auth.assert(!isRemoved, '商品已下架');
    ctx.body = {
        success: 1,
        data: goods
    };
});

//deprecated
router.get('/goods/detail/:goods_id', async (ctx, next) => {
    let goods = await srv_goods.getDetailById(ctx.params.goods_id, ctx.state.user);
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

    let goods = await srv_goods.getBaseInfoById(ctx.params.goods_id);
    ctx.body = {
        success: 1,
        data: goods
    };
});
