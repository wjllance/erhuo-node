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
let srv_transaction = require('../services/transaction');
let { User, Image, Goods, Order } = require('../models');

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


/**
 * @api {get} /order/sell/  我卖出的
 * @apiName     GetOrderBuy
 * @apiGroup    Order
 *
 * @apiSuccess  {Number}    success
 * @apiSuccess  {Object}    data
 *
 */
router.get('/order/sell/', auth.loginRequired, async (ctx, next) => {
    let pageNo = ctx.query.pageNo || 1;
    let pageSize = Math.min(ctx.query.pageSize || 6, 20); // 最大20，默认6
    let condi = {
        seller: ctx.state.user._id,
        order_status: { $ne: config.CONSTANT.ORDER_STATUS.TOPAY}
    };
    console.log(condi);
    let orders = await srv_order.getOrderList(condi, pageNo, pageSize);

    ctx.body = {
        success: 1,
        data: orders
    };
});

/**
 * @api {post} /order/  下单
 * @apiName     OrderCreate
 * @apiGroup    Order
 *
 * @apiSuccess  {Number}    success
 * @apiSuccess  {Object}    data
 *
 */
router.post('/order/', auth.loginRequired, async(ctx, next) => {
    let goods = await srv_goods.getCardInfoById(ctx.request.body.goodsId);
    auth.assert(goods, "商品不存在");

    let order = await srv_order.findOrCreate(goods, ctx.state.user);

    ctx.body = {
        success: 1,
        data: order._id
    };

});



/**
 * @api     {post}  /order/create_pay/  下单并支付
 * @apiName     OrderCreateAndPay
 * @apiGroup    Order
 *
 * @apiSuccess  {Number}    success
 * @apiSuccess  {Object}    data
 *
 */
router.post('/order/create_pay', auth.loginRequired, async(ctx, next) => {
    let goods = await srv_goods.getCardInfoById(ctx.request.body.goodsId);
    auth.assert(goods, "商品不存在");
    let order = await srv_order.findOrCreate(goods, ctx.state.user);
    console.log(order);
    auth.assert(order.order_status == config.CONSTANT.ORDER_STATUS.TOPAY, "订单已支付");
    let res = await srv_wechat.getPayParams(order._id);
    ctx.body = {
        success: 1,
        data: res
    };

});


/**
 * @api     {post}  /order/confirm/  确认收货
 * @apiName     OrderConfirm
 * @apiGroup    Order
 *
 *
 * @apiParam    {String}    orderId
 *
 * @apiSuccess  {Number}    success
 * @apiSuccess  {Object}    data
 *
 */
router.post('/order/confirm', auth.loginRequired, async(ctx, next) => {

    //TODO: 原子性！！！！
    let order = await Order.findById(ctx.request.body.orderId);
    auth.assert(order, "订单不存在");
    // auth.assert(order.buyer == ctx.state.user._id, "无权限");
    await srv_order.confirm(order);
    let transac = await srv_transaction.incomeByOrder(order);
    transac.status = 1;
    await transac.save();
    ctx.body = {
        success:1,
    }
});


router.post('/order/cancel', auth.loginRequired, async(ctx, next) => {

    //TODO: 原子性！！！！
    let order = await Order.findById(ctx.request.body.orderId);
    auth.assert(order, "订单不存在");
    // auth.assert(order.buyer == ctx.state.user._id, "无权限");
    // await srv_order.cancel(order);
    // let transac = await srv_transaction.refund(order);
    // transac.status = 1;
    // await transac.save();
    // ctx.body = {
    //     success:1,
    // }
});

/**
 * @api     {get}  /order/detail/:order_id  订单详情
 * @apiName     OrderDetail
 * @apiGroup    Order
 *
 * @apiSuccess  {Number}    success
 * @apiSuccess  {Object}    data
 *
 */
router.get('/order/detail/:order_id', auth.loginRequired, async (ctx, next) => {
    let order = await srv_order.getDetailById(ctx.params.order_id);
    ctx.body = {
        success:1,
        data: order
    }
});








