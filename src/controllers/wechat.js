
require('should');
let Router = require('koa-router');

let _ = require('lodash');

let config = require('../config');
let auth = require('../services/auth');
let wechat = require('../services/wechat');
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
    let xmlData = ctx.data.xml;
    console.log(xmlData);
    const toUserName = xmlData.ToUserName[0],  // 开发者微信号
        fromUserName = xmlData.FromUserName[0],  // 发送方帐号（一个OpenID）
        createTime = xmlData.CreateTime[0],  //	消息创建时间 （整型）
        msgType = xmlData.MsgType[0],	//消息类型，event
        event = xmlData.Event[0];  // 事件类型，subscribe
    auth.assert(fromUserName, "MISS");
    auth.assert(msgType, "MISS");
    auth.assert(event, "MISS");
    if (msgType ==="event"){
        if (event === "subscribe"){
            wechat.update_userInfo_by_openId(fromUserName);
        }
    }
    ctx.body = {}
});