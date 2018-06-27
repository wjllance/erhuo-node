
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
let {Order, Bargain} = require('../models');

const router = module.exports = new Router();




/**
 * @api {get} /bargain/goods/:goods_id  砍价商品详情？
 * @apiName     BargainGoods
 * @apiGroup    Bargain
 *
 * @apiSuccess  {Number}    success
 * @apiSuccess  {Object}    data
 *
 */
router.get('/bargain/goods', async (ctx, next) => {

});


/**
 * @api {post} /bargain/  发起砍价
 * @apiName     BargainCreate
 * @apiGroup    Bargain
 *
 * @apiSuccess  {Number}    success
 * @apiSuccess  {Object}    data
 *
 */
router.post('/bargain/', async (ctx, next) => {


});


/**
 * @api {post}  /bargain/join  参与砍价
 * @apiName     BargainJoin
 * @apiGroup    Bargain
 *
 * @apiSuccess  {Number}    success
 * @apiSuccess  {Object}    data
 *
 */
router.post('/bargain/join', async (ctx, next) => {


});