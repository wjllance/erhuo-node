
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
    let ret_body = "";
    const toUserName = xmlData.ToUserName[0],  // 开发者微信号
        fromUserName = xmlData.FromUserName[0],  // 发送方帐号（一个OpenID）
        createTime = xmlData.CreateTime[0],  //	消息创建时间 （整型）
        msgType = xmlData.MsgType[0];	//消息类型，event
    auth.assert(fromUserName, "MISS");
    auth.assert(msgType, "MISS");
    switch (msgType){
        case "event":
            const event = xmlData.Event[0];  // 事件类型，subscribe
            auth.assert(event, "MISS");
            switch (event){
                case "subscribe":
                    wechat.update_userInfo_by_openId(fromUserName);
                    break;
            }
            break;
        case "text":
            const content = xmlData.Content;
            auth.assert(content, "MISS");
            ret_body = wechat.dealText("您的消息已收到。",fromUserName, toUserName);
            break;
        case "image":
            break;
        case "voice":
            break;
        case "video":
            break;
        case "shortvideo":
            break;
        case "location":
            break;
        case "link":
            break;
        default:
            break;
    }
    ctx.body = {
        success:1,
        data:ret_body
    };
});

router.post('/wechat/qrcode', async (ctx, next) => {
    let scene = ctx.request.body.scene;
    let path = ctx.request.body.path;
    auth.assert(scene, "miss scene");
    auth.assert(path, "miss path");
    let filename = await wechat.qrcode(scene, path);
    // console.log(Buffer.isBuffer(body));
    // ctx.length = Buffer.byteLength(body);

    ctx.body = {
        success:1,
        data: config.SERVER.URL_PREFIX + '/' + filename
    }
});

