
require('should');
let Router = require('koa-router');

let _ = require('lodash');

let config = require('../config');
let auth = require('../services/auth');
const crypto = require('crypto')

const router = module.exports = new Router();

/**
 * @apiName 微信服务器验证接口
 */
router.get('/wechat', async (ctx, next) => {
    let params = ctx.query;
    // let params = ctx.data.xml;
    console.log(params)

    const token = config.SA_TOKEN, // 自定义，与公众号设置的一致
        signature = params.signature,
        timestamp = params.timestamp,
        nonce = params.nonce;
    auth.assert(signature, "MISS")
    auth.assert(timestamp, "MISS")
    auth.assert(nonce, "MISS")

    // 字典排序
    const arr = [token, timestamp, nonce].sort()
    console.log(arr);
    const sha1 = crypto.createHash('sha1')
    sha1.update(arr.join(''))
    const result = sha1.digest('hex')

    if (result === signature) {
        ctx.body = params.echostr
    } else {
        ctx.body = { code: -1, msg: "fail"}
    }
});


/**
 * @apiName 微信服务器事件监听窗口
 */
router.post('/wechat', async (ctx, next) => {
    let params = ctx.query;
    console.log(params);
    let requestBody = ctx.request.body;
    console.log(requestBody);
    let xmlData = ctx.data.xml;
    console.log(xmlData);

    const token = config.SA_TOKEN, // 自定义，与公众号设置的一致
        signature = params.signature,
        timestamp = params.timestamp,
        nonce = params.nonce;
    auth.assert(signature, "MISS");
    auth.assert(timestamp, "MISS");
    auth.assert(nonce, "MISS");

    // 字典排序
    const arr = [token, timestamp, nonce].sort();
    console.log(arr);
    const sha1 = crypto.createHash('sha1');
    sha1.update(arr.join(''));
    const result = sha1.digest('hex');

    if (result === signature) {
        ctx.body = params.echostr
    } else {
        ctx.body = { code: -1, msg: "fail"}
    }
});