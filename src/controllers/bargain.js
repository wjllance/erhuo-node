
require('should');
let Router = require('koa-router');

let _ = require('lodash');

let utils = require('utility');
let log4js = require('log4js');
let logger = log4js.getLogger('errorLogger');
let config = require('../config');
let auth = require('../services/auth');
let wechat = require('../services/wechat');
let srv_wxtemplate = require('../services/wechat_template');
let srv_bargain = require('../services/bargain');
let {Order, Goods, Bargain} = require('../models');

const router = module.exports = new Router();


/**
 * @api {get} /bargain/goods/:goods_id  砍价商品详情
 * @apiName     BargainGoods
 * @apiGroup    Bargain
 *
 *
 * @apiParam    {String}    bargainId
 *
 * @apiSuccess  {Number}    success
 * @apiSuccess  {Object}    data
 *
 */
router.get('/bargain/:bargainId', auth.loginRequired, async (ctx, next) => {

    let bargainDet = await srv_bargain.getDetailById(ctx.params.bargainId);

    let joinBargain = await srv_bargain.joinBargain(bargainDet, ctx.state.user, bargainDet.rest - 0.01);

    let ret = bargainDet;

    if(joinBargain == null){
        ret.user = null;
        ret.disable = true;
    }else{
        ret = await srv_bargain.getDetailById(joinBargain._id);
        ret.is_new = joinBargain.is_new;
    }

    console.log(bargainDet);

    ret.is_owner = ctx.state.user._id.equals(bargainDet.owner._id);

    ctx.body = {
        success:1,
        data: ret
    }
});


/**
 * @api {post} /bargain  发起砍价
 * @apiName     BargainCreate
 * @apiGroup    Bargain
 *
 *
 * @apiParam    {String}    goodsId
 *
 * @apiSuccess  {Number}    success
 * @apiSuccess  {Object}    data
 *
 */
router.post('/bargain', auth.loginRequired, async (ctx, next) => {

    let goods = await Goods.findById(ctx.request.body.goodsId);
    auth.assert(goods && goods.is_special, "商品不存在或不能参与砍价");

    let bargain = await srv_bargain.findOrCreate(goods, ctx.state.user);
    ctx.body = {
        success:1,
        data: bargain._id
    }
});



/**
 * deprecated
 * @api {post}  /bargain/join  参与砍价  NO USE!!!
 * @apiName     BargainJoin
 * @apiGroup    Bargain
 *
 * @apiParam    {String}    bargainId
 *
 * @apiSuccess  {Number}    success
 * @apiSuccess  {Object}    data
 *
 */
router.post('/bargain/join', auth.loginRequired, async (ctx, next) => {
    let bargain = await srv_bargain.getDetailById(ctx.require.body.bargainId);
    auth.assert(bargain, "没有");

    let joinBargain = await srv_bargain.joinBargain(bargain, ctx.state.user, bargain.rest);
    let ret = await srv_bargain.getDetailById(joinBargain._id);
    ctx.body = {
        success:1,
        data: ret
    }

});