require('should')

let _ = require('lodash');
const router = module.exports = new Router();


let config = require('../config');
let auth = require('../services/auth');
let srv_goods = require('../services/goods');
let srv_chat = require('../services/chat');
let srv_wechat = require('../services/wechat');
let { User, Image, Goods } = require('../models');

const router = module.exports = new Router();



/**
 * @api {post} /comment/:goods_id  商品评论
 * @apiName     CommentPost
 * @apiGroup    Comment
 *
 *
 * @apiParam    {String}    comment     评论内容
 * @apiParam    {String}    [to]          被回复人ID
 *
 * @apiSuccess  {Number}    success     1success
 * @apiSuccess  {Object}    data        商品详情
 *
 */