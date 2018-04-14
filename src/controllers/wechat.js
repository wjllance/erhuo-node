
require('should');
let Router = require('koa-router');

let _ = require('lodash');

let config = require('../config');
let auth = require('../services/auth');
const crypto = require('crypto')

const router = module.exports = new Router();


router.post('/wechat', async (ctx, next) => {
    let params = ctx.data.xml;
    console.log(params)

    const token = config.SA_TOKEN, // 自定义，与公众号设置的一致
        signature = params.signature,
        timestamp = params.timestamp,
        nonce = params.nonce;
    auth.assert(signature, "MISS")
    auth.assert(timestamp, "MISS")
    auth.assert(nonce, "MISS")

    // 字典排序
    const arr = [token, timestamp[0], nonce[0]].sort()
    console.log(arr);
    const sha1 = crypto.createHash('sha1')
    sha1.update(arr.join(''))
    const result = sha1.digest('hex')

    if (result === signature) {
        ctx.body = params.echostr[0]
    } else {
        ctx.body = { code: -1, msg: "fail"}
    }
});