
require('should');
let Router = require('koa-router');

let utils = require('utility');
let _ = require('lodash');

let config = require('../config');
let auth = require('../services/auth');
let srv_goods = require('../services/goods');
let srv_comment = require('../services/comment');
let srv_wechat = require('../services/wechat')
let { User } = require('../models');
let { Goods } = require('../models');
const crypto = require('crypto')

const router = module.exports = new Router();


router.post('/wechat', async (ctx, next) => {
    const token = config.SA_TOKEN, // 自定义，与公众号设置的一致
        signature = ctx.query.signature,
        timestamp = ctx.query.timestamp,
        nonce = ctx.query.nonce;

    // 字典排序
    const arr = [token, timestamp, nonce].sort()

    const sha1 = crypto.createHash('sha1')
    sha1.update(arr.join(''))
    const result = sha1.digest('hex')

    if (result === signature) {
        ctx.body = ctx.query.echostr
    } else {
        ctx.body = { code: -1, msg: "fail"}
    }
});