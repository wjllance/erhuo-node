require('should');
let Router = require('koa-router');

let _ = require('lodash');
let mzfs = require('mz/fs');
let path = require('path');

let superagent = require('superagent');
let body = require('koa-convert')(require('koa-better-body')());
let moment = require('moment');
moment.locale('zh-cn');
let config = require('../config');
let auth = require('../services/auth');
let srv_goods = require('../services/goods');
let srv_order = require('../services/order');
let wechatService = require('../services/wechat');
let { User, Image, Goods } = require('../models');

const router = module.exports = new Router();
const GOODS_STATUS = config.CONSTANT.GOODS_STATUS;

// 首页, 参数为pageNo(默认为1), pageSize(默认为6)
// 返回值为 goods(list), hasMore(有下一页), totle(记录总条数)

/**
 *
 * @api {get} /v3/goods/index  商品列表
 * @apiName     GoodsList
 * @apiGroup    Goods
 *
 *
 * @apiParam    {Number}    pageNo      当前页码，默认1
 * @apiParam    {Number}    pageSize    每页大小，默认6
 * @apiParam    {String}    category    列表类别 ["美妆","女装","女鞋","数码","配饰","包包","日用","其他"]
 *
 * @apiSuccess  {Number}    success     1success
 * @apiSuccess  {Object}    data        分页商品列表
 * @apiSuccess  {Array}     data.goods  商品列表
 * @apiSuccess  {Boolean}     data.hasMore  还有更多
 * @apiSuccess  {Number}     data.total  总数
 *
 */

//加入审核状态
router.get('/v3/goods/index', async (ctx, next) => {
    let pageNo = ctx.query.pageNo || 1;
    let pageSize = Math.min(ctx.query.pageSize || 12, 20); // 最大20，默认6

    let cate = ctx.query.category;
    let condi = {
        deleted_date: null,
        status: { $ne: GOODS_STATUS.REJECT },
    };
    let sorti = {};
    if (!cate) {
        cate = "推荐";
    }
    if (cate === '服装'){
        cate = '女装'
    }
    if (cate.indexOf('鞋') != -1){
        cate = '女鞋';
    }

    console.log(cate);
    if (cate === "推荐") {
        sorti = {
            glocation: -1,
            gpriority: -1,
            // removed_date:1,
            updated_date: -1,
        };
        condi.category = { $ne: "求购" };
    }
    else if (cate === "今日" || cate === "最新") {

        sorti = {
            glocation: -1,
            created_date:-1,
        };
        console.log(condi, sorti);
    }
    else if (config.CONSTANT.GOODS_CATE.indexOf(cate) !== -1) {
        condi.category = cate;
        sorti = {
            // gpriority:-1,
            removed_date: 1,
            glocation: -1,
            updated_date: -1,
        };
    }
    let user = ctx.state.user;
    if (user) { //not other
        condi.$or = [{
            glocation: user.location,
        }, {
            glocation: 0,
        }];
    }

    console.log(condi, sorti);
    let data = await srv_goods.goodsListV2(user, pageNo, pageSize, condi, sorti);
    ctx.body = {
        success: 1,
        data: data,
    };
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

    let condi = { $and: [] }; //审核
    condi.$and.push({
        $or: [
            { gname: reg },
            { gsummary: reg },
        ],
    });

    let sorti = {
        gpriority: -1,
        // removed_date:1,
        glocation: -1,
        updated_date: -1,
    };
    let user = ctx.state.user;
    if (user) { //not other
        condi.$and.push({
            $or: [
                { glocation: user.location },
                { glocation: 0 },
                { locationName: user.locationName},
                { locationName: user.school}
            ],
        });
    }
    console.log(JSON.stringify(condi.$and), sorti);
    let data = await srv_goods.goodsListV2(user, pageNo, pageSize, condi, sorti);
    ctx.body = {
        success: 1,
        data: data,
    };
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

    let data = ["面膜", "防晒", "唇膏", "眉笔"];

    ctx.body = {
        success: 1,
        data: data,
    };
});

//deprecated
router.post('/goods/publish', auth.loginRequired, async (ctx, next) => {
    let images = await Image.find({ _id: ctx.request.body.gpics });
    auth.assert(images.length === ctx.request.body.gpics.length, '图片不正确');

    for (let i = 0; i < images.length; i++) {
        auth.assert(images[i].userID.equals(ctx.state.user._id), '图片所有者不正确');
    }

    let goods = new Goods();
    goods.userID = ctx.state.user._id;
    goods.gpics = images.map(x => x._id);
    _.assign(goods, _.pick(ctx.request.body, ['gname', 'gsummary', 'glabel', 'gprice', 'gstype', 'glocation', 'gcost', 'gcity', 'category', 'remark']));

    if (!goods.glocation) {
        goods.glocation = ctx.state.user.location || 0;
    }
    if(goods.category === '服装'){
        goods.category = '女装';
    }
    if(goods.category.indexOf('鞋') != -1){
        goods.category = '女鞋';
    }
    await goods.save();

    ctx.body = {
        success: 1,
        data: goods._id.toString(),
    };
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
router.post('/v2/goods/publish', auth.stuAuthRequired, async (ctx, next) => {

    let params = ctx.request.body;
    auth.assert(params.gsummary && params.gprice, "缺少参数");
    auth.assert(params.npics && params.npics.length > 0, "没图");

    let goods = new Goods();
    goods.userID = ctx.state.user._id;
    // goods.gpics = images.map(x => x._id);

    _.assign(goods, _.pick(params, ['gname', 'gsummary', 'glabel', 'npics', 'gprice', 'gstype', 'glocation', 'gcity', 'remark']));

    let reg = /\d+(.\d+)/;
    let res = reg.exec(params.gcost);
    goods.gcost = res ? res[0] : parseFloat(params.gcost);

    goods.category = params.category || "其他";
    goods.gname = params.gname || params.gsummary.substr(0, 20);
    if (!goods.glocation) {
        goods.glocation = ctx.state.user.location || 0;

        if (ctx.state.user.locationName) {
            goods.locationName = ctx.state.user.locationName;
        }
    }
    if(goods.category === '服装'){
        goods.category = '女装';
    }
    if(goods.category.indexOf('鞋') != -1){
        goods.category = '女鞋';
    }

    // if(goods.category === "书籍"){
    //     goods.status = config.CONSTANT.GOODS_STATUS.RELEASED;
    // }
    await goods.save();
    let user = await User.findOne({ _id: ctx.state.user._id });
    await wechatService.sendReplyNotice2(user, "1");

    ctx.body = {
        success: 1,
        data: goods._id,
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
    let myGood = await Goods.findOne({ _id: ctx.params.goods_id });
    auth.assert(myGood, '商品不存在');
    auth.assert(!myGood.removed_date, '商品已下架');
    auth.assert(myGood.userID.equals(ctx.state.user._id), '只有所有者才有权限下架商品');

    myGood.removed_date = Date.now();
    await myGood.save();

    ctx.body = {
        success: 1,
        data: myGood._id.toString(),
    };
});


// nouse
router.post('/goods/remove/', auth.loginRequired, async (ctx, next) => {
    let myGood = await Goods.findById(ctx.request.body.goodsId);
    auth.assert(myGood, '商品不存在');
    auth.assert(!myGood.removed_date, '商品已下架');
    auth.assert(myGood.userID.equals(ctx.state.user._id), '只有所有者才有权限下架商品');
    myGood.removed_date = Date.now();
    await myGood.save();
    ctx.body = {
        success: 1,
        data: myGood._id.toString(),
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
    let myGood = await Goods.findOne({ _id: ctx.params.goods_id });
    auth.assert(false, "暂时不能删除商品");


    auth.assert(myGood, '商品不存在');
    let isRemoved = srv_goods.isGoodRemoved(myGood);
    auth.assert(isRemoved, '商品未下架，不能删除');
    auth.assert(myGood.userID.equals(ctx.state.user._id), '只有所有者才有权限删除商品');
    _.assign(myGood, { 'deleted_date': Date.now() });
    console.log(myGood);
    await myGood.save();
    ctx.body = {
        success: 1,
        data: myGood._id.toString(),
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

    if (ctx.request.body.gpics) {
        let images = await Image.find({ _id: ctx.request.body.gpics });
        auth.assert(images.length == ctx.request.body.gpics.length, '图片不正确');

        for (let i = 0; i < images.length; i++) {
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
        data: await srv_goods.getDetailByIdV2(ctx.params.goods_id, ctx.state.user),
    };
});

router.put('/v2/goods/:goods_id', auth.loginRequired, async (ctx, next) => {
    let goods = await Goods.findById(ctx.params.goods_id);
    auth.assert(goods, '商品不存在');
    auth.assert(goods.userID.equals(ctx.state.user._id), '无权限');

    if (ctx.request.body.gpics) {
        goods.npics = ctx.request.body.gpics;
    }
    _.assign(goods, _.pick(ctx.request.body, ['gname', 'gsummary', 'glabel', 'gprice', 'gcost']));
    goods.updated_date = Date.now();
    await goods.save();
    ctx.body = {
        success: 1,
        data: await srv_goods.getDetailByIdV2(ctx.params.goods_id, ctx.state.user),
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
        data: goods,
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
        data: goods,
    };
});


router.get('/goods/get_book_by_isbn/:isbn', async (ctx, next) => {
    let isbn = ctx.params.isbn;

    let api_url = "https://api.douban.com/v2/book/isbn/" + isbn;

    try {

        let { text } = await superagent.get(api_url);
        console.log(text);
        let res = JSON.parse(text);
        ctx.body = {
            success: 1,
            data: res,
        };
    } catch (e) {
        console.error(e);
        ctx.body = {
            success: 1,
        };
    }
});

//获取当前数据库的用户信息
router.get('/goods/forTaoGoodsInfo', async(ctx, next)=>{

    let total = await Goods.find().count();
    console.log("前端访问有问题");
    let pageNo = ctx.query.pageNo || 1;
    let pageSize = Math.min(ctx.query.pageSize || 20, 20); // 最大20，默认6
    // let condi = { created_date: { $gte: moment};
    let now = moment().toISOString();

    let condi = {
        created_date: {$lte: new Date("2018-10-31T03:15:57.672Z") }
    };

    console.log(now,"时间的值");
    let  userList = await Goods.find(condi)
        .limit(pageSize)
        .skip((pageNo - 1) * pageSize);
    console.log(userList);

    ctx.body = {
        success:1,
        total:total,
        data: userList,
        pageNo:pageNo
    }
});
