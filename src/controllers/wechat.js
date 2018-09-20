
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
let srv_order = require('../services/order');
let srv_transaction = require('../services/transaction');
let {Order, Identity} = require('../models');

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
    const result = utils.sha1(arr.join('')).toUpperCase();

    if (result === signature) {
        ctx.body = params.echostr
    } else {
        ctx.body = { code: -1, msg: "fail"}
    }
});

router.get('/wechat_mp', async (ctx, next) => {
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
    const result = utils.sha1(arr.join(''));

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
                    let mes="欢迎关注IM二货兔，本兔兔是 校内小仙女的二手衣妆交易平台，发现本校周边童鞋的闲置物品，越省钱越美丽\n" +
                        "IM二货兔刚刚发布，各位公主担待点，一起走向未来~\n" +
                        "有爱的家庭，欢迎大家~";
                    ret_body = wechat.dealText(mes,toUserName, fromUserName);
                    break;
                case "unsubscribe":
                case "SCAN":
                case "LOCATION":
                case "CLICK":
                case "VIEW":
                    break;
            }
            break;
        case "text":
            const content = xmlData.Content;
            auth.assert(content, "MISS");
            let mes = "谢谢您的消息，可联系微信 lovelyRHT 快速对接~";
            if (String(content).match(/购买|买|卖|出售/)){
                mes = "要买卖的话可以用二货兔小程序哦~戳菜单栏“进入平台”，即可参与买卖啦，还不快去做生意~"
            }
            ret_body = wechat.dealText(mes,toUserName, fromUserName);
            break;
        case "image":
        case "voice":
        case "video":
        case "shortvideo":
        case "location":
        case "link":
        default:
            let mes2 = "谢谢您的消息，可联系微信 lovelyRHT 快速对接~";
            ret_body = wechat.dealText(mes2,toUserName, fromUserName);
            break;
    }
    ctx.res.setHeader('Content-Type', 'application/xml');
    ctx.res.end(ret_body)
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



router.post('/wechat/pay', async(ctx, next) => {

    auth.assert(ctx.request.body.oid, "miss oid")
    let res = await wechat.getPayParams(ctx.request.body.oid);
    ctx.body = {
        success:1,
        data: res
    }
});


router.post('/wechat/notify', async(ctx, next) => {

    let xmlData = ctx.data.xml;

    logger.info(xmlData);
    console.log(xmlData);
    let ret_body = '<xml>\n' +
        '  <return_code><![CDATA[FAIL]]></return_code>\n' +
        '  <return_msg><![CDATA[empty]]></return_msg>\n' +
        '</xml>';

    auth.assert(wechat.checkMchSig(xmlData), '签名错误1');
    if(xmlData.return_code[0] == "SUCCESS"){
        let order = await srv_order.checkPay(xmlData.out_trade_no[0], xmlData.result_code[0], xmlData.total_fee[0]);
        if(order){
            await srv_transaction.createIncome(order);
            await srv_wxtemplate.sendPaidTemplate(order)
        }
        ret_body = '<xml>\n' +
            '  <return_code><![CDATA[SUCCESS]]></return_code>\n' +
            '  <return_msg><![CDATA[OK]]></return_msg>\n' +
            '</xml>';
    }

    ctx.status = 200;
    ctx.res.setHeader('Content-Type', 'application/xml');
    ctx.res.end(ret_body)
    // auth.assert(order_id, "oid miss")
    // let res = await wechat.getPayParams(order_id);
});


/**
 * mock wechat notify
 */
router.post('/mock/wechat/notify', async(ctx, next) => {
    if(config.ENV != "local"){
        return;
    }
    let order = await Order.findById(ctx.request.body.orderId)
    order = await srv_order.checkPay(order.sn, "SUCCESS", order.price*100);
    if(order){
        await srv_transaction.createIncome(order);
    }
    ctx.body = {
        success:1
    }

});

router.get('/wechat/query_order', async(ctx, next) => {

    let order_id = ctx.query.oid;
    auth.assert(order_id, "oid miss")
    let res = await wechat.queryOrder(order_id);
    ctx.body = {
        success:1,
        data: res
    }
});



router.post('/wechat/refund', async(ctx, next) => {

});


router.post('/wechat/notify_auth_result', async(ctx, next) => {
    let identity = await Identity.findById(ctx.request.body.identity_id);
    console.log(identity);
    let res = await srv_wxtemplate.sendAuthResult(identity.userID, identity.status === 1);
    ctx.body = {
        success: res
    }
});

/**
 * @apiName 微信服务器事件监听窗口
 */
router.post('/wechat_mp', async (ctx, next) => {
    let xmlData = ctx.data.xml;
    console.log(xmlData);
    let ret_body = "";
    const toUserName = xmlData.ToUserName[0],  // 开发者微信号
        fromUserName = xmlData.FromUserName[0],  // 发送方帐号（一个OpenID）
        createTime = xmlData.CreateTime[0],  //	消息创建时间 （整型）
        msgType = xmlData.MsgType[0];	//消息类型，event
    auth.assert(fromUserName, "MISS");
    auth.assert(msgType, "MISS");
    let mes4 = "谢谢您的消息，可联系微信 lovelyRHT 快速对接~";
    switch (msgType){
        case "text":
            wechat.mpmsg(fromUserName,mes4);
            break;
    }
    let mes2 = "success";
    ret_body = wechat.dealText(mes2,toUserName, fromUserName);
    ctx.res.setHeader('Content-Type', 'application/xml');
    ctx.res.end(ret_body)
});