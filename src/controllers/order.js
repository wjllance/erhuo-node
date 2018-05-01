require('should');
let Router = require('koa-router');

let _ = require('lodash');
let mzfs = require('mz/fs');
let path = require('path');
let body = require('koa-convert')(require('koa-better-body')());

let config = require('../config');
let auth = require('../services/auth');
let srv_goods = require('../services/goods');
let srv_order = require('../services/order');
let srv_wechat = require('../services/wechat');
let { User, Image, Goods } = require('../models');

const router = module.exports = new Router();
const schools = config.CONSTANT.SCHOOL
const school_map = require('../config').CONSTANT.SCHOOL_MAP


/**
 * @api {get} /order/buy/  我买到的
 * @apiName     GetOrderBuy
 * @apiGroup    Order
 *
 * @apiSuccess  {Number}    success
 * @apiSuccess  {Object}    data
 *
 */
router.get('/order/buy/', auth.loginRequired, async (ctx, next) => {

    let pageNo = ctx.query.pageNo || 1;
    let pageSize = Math.min(ctx.query.pageSize || 6, 20); // 最大20，默认6
    let condi = {
        buyer: ctx.state.user._id
    };
    let orders = await srv_order.getOrderList(condi, pageNo, pageSize);

    ctx.body = {
        success: 1,
        data: orders
    };
});

router.get('/order/sell/', auth.loginRequired, async (ctx, next) => {
    let pageNo = ctx.query.pageNo || 1;
    let pageSize = Math.min(ctx.query.pageSize || 6, 20); // 最大20，默认6
    let condi = {
        seller: ctx.state.user._id
    };
    let orders = await srv_order.getOrderList(condi, pageNo, pageSize);

    ctx.body = {
        success: 1,
        data: orders
    };

});

router.post('/order/', auth.loginRequired, async(ctx, next) => {
    let goods = await srv_goods.getCardInfoById(ctx.request.body.goodsId);
    auth.assert(goods, "商品不存在");

    let order = await srv_order.findOrCreate(goods, ctx.state.user);

    ctx.body = {
        success: 1,
        data: order._id
    };

});

router.post('/order/create_pay', auth.loginRequired, async(ctx, next) => {
    let goods = await srv_goods.getCardInfoById(ctx.request.body.goodsId);
    auth.assert(goods, "商品不存在");
    let order = await srv_order.findOrCreate(goods, ctx.state.user);
    let res = await srv_wechat.getPayParams(order._id);
    ctx.body = {
        success: 1,
        data: res
    };

});


router.post('/order/receive', auth.loginRequired, async(ctx, next) => {

});

router.get('/order/detail/:order_id', auth.loginRequired, async (ctx, next) => {


});








