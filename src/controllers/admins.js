require('should');
let Router = require('koa-router');
const moment = require('moment');
let _ = require('lodash');
let auth = require('../services/auth');
let utils = require('utility');
let log4js = require('log4js');
let logger = log4js.getLogger('errorLogger');
let config = require('../config');
let adminService = require('../services/admin');
let WXBizDataCrypt = require('../services/WXBizDataCrypt');
let { User, Goods, Identity } = require("../models");
let srv_message = require('../services/message');
const router = module.exports = new Router();
let srv_goods = require('../services/goods');
let srv_wxtemplate = require('../services/wechat_template');
router.get('/admin/reject_goods', auth.loginRequired, async (ctx, next) => {

    let mygroups = await srv_wxgroup.getGroupList(ctx.state.user);

    ctx.body = {
        success: 1,
        data: mygroups
    }
});

/**
 * @api {post} /admin/register 管理员注册
 * @apiName     adminRegist
 * @apiGroup    admin
 *
 *
 * @apiParam    {String}    code     注册码
 * @apiParam    {String}    realname  真实姓名
 * @apiParam    {String}    manage_location  管理的范围
 * @apiParam    {String}    admin_id  管理员id (不同的id对应不同的角色)
 *
 *
 *
 * @apiSuccess  {Number}    success
 * @apiSuccess  {Object}    data    所创建的管理员的基本信息
 *
 */
router.post('/admin/register', auth.loginRequired, async (ctx, next) => {

    let code = ctx.request.body.code;
    auth.assert(code, "code值不能为空");
    let realname = ctx.request.body.realname;
    let managelLocation = ctx.request.body.manage_location;
    let admin_id = ctx.request.body.admin_id;
    let admin = await adminService.registAdmin(realname, managelLocation, admin_id);
    ctx.body = {
        success: 1,
        data: admin
    }
});


/**
 * @api {post} /admin/login   管理员登陆
 * @apiName     adminRegist
 * @apiGroup    admin
 *
 *
 * @apiParam    {String}    code     微信给予的code
 * @apiParam    {String}    nickName  昵称
 * @apiParam    {String}    avatarUrl  头像地址
 *
 *
 * @apiSuccess  {Number}    success
 * @apiSuccess  {Object}    data    管理员的id
 *
 */
router.post('/admin/login', async (ctx, next) => {
    let msg = await adminService.login(ctx, ctx.request.body.code,ctx.request.body.account);
    ctx.body = {
        success: 1,
        data: msg
    };
});

// 更新基本资料（来自微信）
/**
 * @api {post}   /admin/update   管理员更新
 * @apiName     Update
 * @apiGroup    admin
 */

router.post('/admin/update', auth.adminRequired, async (ctx, next) => {

    console.log("here is update");

    let loginUser = ctx.state.adminuser;

    if(!loginUser.nickName){
        auth.assert(ctx.request.body.signature === utils.sha1(ctx.request.body.rawData + loginUser.session_key), '签名错误1');

        let pc = new WXBizDataCrypt(config.ADMIN_APP_ID, loginUser.session_key);
        let data = pc.decryptData(ctx.request.body.encryptedData, ctx.request.body.iv);

        auth.assert(data.openId === ctx.state.adminuser.openid, '签名错误2');
        auth.assert(data.watermark.appid === config.ADMIN_APP_ID, '水印错误');
        console.log(data);
        _.assign(loginUser, _.pick(ctx.request.body.userInfo, ['nickName', 'avatarUrl',]));
        loginUser.unionid = data.unionId;

        ctx.state.adminuser = await loginUser.save();
    }
    // console.log(ctx.request.body.signature+"============="+utils.sha1(ctx.request.body.rawData + loginUser.session_key))
    //
    ctx.body = {
        success: 1,
        data: loginUser
    };
});


// 更新基本资料（来自微信）
/**
 * @api {post}   /admin/apdate_status  管理员更新
 * @apiName     UpdateStatus
 * @apiGroup    admin
 */

//更新用户的状态
router.post('/admin/apdate_status', auth.loginRequired, async (ctx, next) => {

    console.log("here is update userAuth");

    let authId = ctx.request.body.authId;
    let userId = ctx.request.body.userId;
    let content = ctx.request.body.content;
    auth.assert(authId && userId,"缺少参数");
    let adminUser = ctx.state.adminuser;
    console.log(authId+"更改标识");
    let identity= null;
    let res= null;
    if(authId==="1"){
        identity =  await Identity.findOne({userID : userId});
        identity.status = 1;
        await identity.save();
        console.log("更改成功"+identity.userID);
        res = await srv_wxtemplate.sendAuthResult(identity.userID, identity.status === 1,null);
    }
    if(authId==="0"){
        identity =  await Identity.findOne({userID : userId});
        identity.status = 0;
        await identity.save();
        console.log("更改不通过成功"+identity.userID);
         res = await srv_wxtemplate.sendAuthResult(identity.userID, identity.status === 0,content);
    }
    console.log(res,"+++++++++++++++++++++++++++++")
    ctx.body = {
        success: 1,
        data: res
    };
});


/**
 *
 * @api {get} /admin/goods/list  商品列表
 * @apiName     GoodsList
 * @apiGroup    Goods
 *
 *
 * @apiParam    {Number}    pageNo      当前页码，默认1
 * @apiParam    {Number}    pageSize    每页大小，默认6
 *
 * @apiSuccess  {Number}    success     1success
 * @apiSuccess  {Object}    data        分页商品列表
 * @apiSuccess  {Array}     data.goods  商品列表
 * @apiSuccess  {Boolean}     data.hasMore  还有更多
 * @apiSuccess  {Number}     data.total  总数
 *
 */

//获取商品列表
router.get('/admin/goods/list', async (ctx, next) => {
    let pageNo = ctx.query.pageNo || 1;
    let pageSize = Math.min(ctx.query.pageSize || 12, 20); // 最大20，默认6


    let data = await srv_goods.admingoodsList( pageNo, pageSize);
    ctx.body = {
        success: 1,
        data: data,
    };
});


/**
 *
 * @api {post} /admin/goods/Detail     获取所要修改商品的详情
 * @apiName     adminGoodsDetail
 * @apiGroup    admin
 *
 *
 * @apiParam    {Number}    goodsId       修改商品的id
 *
 *
 * @apiSuccess  {Number}    success     1success
 * @apiSuccess  {Object}    data        商品详情
 *
 */

//获取所要审核商品的详情
router.get('/admin/goods/Detail', async (ctx, next) => {

    let goodsId = ctx.query.goodsId;
    console.log(goodsId);

    let goods = await  Goods.findOne({ _id : goodsId});
    console.log(goods+"==============================")
    ctx.body = {
        success: 1,
        data: goods,
    };
});




/**
 *
 * @api {post} /admin/goods/examine   修改商品优先级，审核状态
 * @apiName     GoodsList
 * @apiGroup    Goods
 *
 *
 * @apiParam    {Number}    priotity      所要修改的优先级
 * @apiParam    {Number}    goodsId       修改商品的id
 *@apiParam    {Number}    status          修改商品的状态
 *
 *
 * @apiSuccess  {Number}    success     1success
 * @apiSuccess  {Object}    data        修改之后的商品详情
 *
 */

//审核商品的状态以及优先级
router.post('/admin/goods/examine', async (ctx, next) => {
     let priority = ctx.request.body.priority;
     let goodsId = ctx.request.body.goodsId;
     let status = ctx.request.body.status;
    let category = ctx.request.body.category;
     let goods = await Goods.findOne({ _id : goodsId});;
     if(priority){
         goods.gpriority = priority;

     }
     if(status){
         goods.status=status;

     }
    goods.category = category;
    await goods.save();
    ctx.body = {
        success: 1,
        data: goods,
    };
});
