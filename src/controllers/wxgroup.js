
require('should');
let Router = require('koa-router');
const moment = require('moment');
let _ = require('lodash');

let utils = require('utility');
let log4js = require('log4js');
let logger = log4js.getLogger('errorLogger');
let config = require('../config');
let mUtils = require('../myUtils/mUtils');

let auth = require('../services/auth');
let wechat = require('../services/wechat');
let srv_wxtemplate = require('../services/wechat_template');
let srv_bargain = require('../services/bargain');
let srv_wxgroup = require('../services/wxgroup');
let srv_goods = require('../services/goods');
let {User, Goods, UserGroup, wxGroup, GroupCheckIn, TodayBonusSchema} = require('../models');

let WXBizDataCrypt = require('../services/WXBizDataCrypt');


const router = module.exports = new Router();


/**
 * @api {get}   /group/my       我的群列表
 * @apiName     MyGroupList
 * @apiGroup    Group
 *
 *
 * @apiSuccess  {Number}    success
 * @apiSuccess  {Object}    data
 *
 */
router.get('/group/my', auth.loginRequired, async (ctx, next) => {

    let mygroups = await srv_wxgroup.getGroupList(ctx.state.user);

    ctx.body = {
        success:1,
        data: mygroups
    }
});


router.del('/group/:groupId', auth.loginRequired, async (ctx, next)=>{

});


/**
 * @api {get}   /group/:groupId/feed    群商品
 * @apiName     GroupFeed
 * @apiGroup    Group
 *
 *
 * @apiSuccess  {Number}    success
 * @apiSuccess  {Object}    data
 *
 */
router.get('/group/:groupId/feed', async (ctx, next) => {

    let group = await wxGroup.findById(ctx.params.groupId);
    auth.assert(group, "没有群");

    let pageNo = ctx.query.pageNo || 1;
    let pageSize = Math.min(ctx.query.pageSize || 12, 20); // 最大20，默认6

    let cate = ctx.query.category;
    let condi = {
        deleted_date:null,
    };
    let sorti = {};
    if(!cate)
    {
        cate = "今日";
    }

    console.log(cate);

    if(cate === "今日"){
        let ddl = moment().subtract(1,'d');

        condi.created_date = {
            // $gt: moment().subtract(1, 'd')
            $gt: ddl
        };
        sorti = {
            removed_date: 1,
            created_date:-1
        };
    }else{
        sorti = {
            removed_date: 1,
            updated_date:-1
        };
    }
    console.log(condi, sorti);


    let gusers = await srv_wxgroup.getMembers(group._id);

    // console.log("group users...", gusers);

    condi.userID = {
        $in: _.map(gusers, u=>u._id)
    };

    let user = ctx.state.user;
    // if(user){ //not other
    //     condi.$or=[{
    //         glocation:user.location
    //     },{
    //         glocation:0
    //     }]
    // }
    let ret = await srv_goods.goodsListV2(user, pageNo, pageSize, condi, sorti);

    ctx.body = {
        success:1,
        data:ret
    }
});


/**
 * @api {post}  /group/join    加入群
 * @apiName     GroupJoin
 * @apiGroup    Group
 *
 *
 * @apiParam    {String}    groupId
 * @apiParam    {String}    [userId]
 * @apiParam    {Boolean}   [GOD]
 *
 *
 * @apiSuccess  {Number}    success
 * @apiSuccess  {Object}    data
 *
 */
router.post('/group/join', async (ctx, next) => {

    let groupId = ctx.request.body.groupId;

    let wxgroup = await wxGroup.findById(groupId);
    auth.assert(wxgroup, "群不在");

    let user = null;
    if (ctx.request.body.GOD){
        user = await User.findById(ctx.request.body.userId);
    }
    else {
        await auth.loginRequired(ctx, next);
        user = ctx.state.user;
    }
    wxgroup = await srv_wxgroup.createUserGroup(wxgroup, user);

    ctx.body = {
        success:1,
        data: wxgroup
    }
});


/**
 * @api {get}  /group/:groupId/info    群信息
 * @apiName     GroupInfo
 * @apiGroup    Group
 *
 * @apiParam    {Boolean}   [withMembers]
 *
 * @apiSuccess  {Number}    success
 * @apiSuccess  {Object}    data
 *
 */
router.get('/group/:groupId/info', async (ctx, next) => {

    let wxgroup = await wxGroup.findById(ctx.params.groupId);
    auth.assert(wxgroup, "群不在");

    let ret = {
        group : wxgroup
    };
    if(ctx.query.withMembers){
        ret.members = await srv_wxgroup.getMembers(ctx.params.groupId);
    }
    ctx.body = {
        success:1,
        data: ret
    }
});

/**
 * @api {post}  /group/update    群信息更新
 * @apiName     GroupUpdate
 * @apiGroup    Group
 *
 * @apiParam    {String}    encryptedData       加密信息
 * @apiParam    {String}    iv
 *
 * @apiParam    {String}    [join]   是否入群
 *
 * @apiSuccess  {Number}    success
 * @apiSuccess  {Object}    data
 *
 */
router.post('/group/update', auth.loginRequired, async (ctx, next) =>{

    let reqParams = ctx.request.body;
    console.log(reqParams);


    let pc = new WXBizDataCrypt(config.APP_ID, ctx.state.user.session_key);
    let decryptedData = pc.decryptData(reqParams.encryptedData, reqParams.iv);

    auth.assert(decryptedData.watermark.appid === config.APP_ID, '水印错误');

    console.log(decryptedData);
    auth.assert(decryptedData.openGId, "没");

    let condi = {openGId:decryptedData.openGId};

    let wxgroup = await wxGroup.findOne(condi);
    if(!wxgroup){
        wxgroup = new wxGroup(condi);
        await wxgroup.save();
    }

    if(reqParams.join){
        wxgroup = await srv_wxgroup.createUserGroup(wxgroup, ctx.state.user);
    }

    ctx.body = {
        success:1,
        data: wxgroup
    }
});


/**
 * @api {get}  /group/:groupId/members    全部群成员
 * @apiName     GroupMembers
 * @apiGroup    Group
 *
 * @apiSuccess  {Number}    success
 * @apiSuccess  {Object}    data
 *
 */
router.get('/group/:groupId/members', auth.loginRequired, async (ctx, next) => {
    let ret = await srv_wxgroup.getMembers(ctx.params.groupId);
    ctx.body = {
        success:1,
        data:ret
    }
});


/**
 * @api {post}  /group/check_in   签到
 * @apiName     GroupCheckIn
 * @apiGroup    Group
 *
 * @apiSuccess  {Number}    success
 * @apiSuccess  {Object}    data
 *
 */
router.post('/group/check_in', auth.loginRequired, async (ctx, next) => {
    let groupId = ctx.request.body.groupId;
    let condi = {
        group_id: groupId,
        userID: ctx.state.user._id,
        deleted_date:null
    };
   let userGroup = await UserGroup.findOne(condi);
   console.log(condi);

   auth.assert(userGroup, "不在这个群");
   let checkIn = await GroupCheckIn.findOne({
       userID: ctx.state.user._id,
       group_id: groupId,
       created_date: {
           $gt: moment({hour: 0})
       }
   });
    if(!checkIn){
       checkIn = await GroupCheckIn.create({
           userID: ctx.state.user._id,
           group_id: groupId,
           created_date: moment()
       });
       userGroup.check_in_times ++;
       await userGroup.save();
       console.log("updating check in times...", userGroup);
    }else{
        console.log("签过了");
    }
    ctx.body = {
       success:1,
        data: checkIn
    }

});

/**
 * @api {get}  /group/:groupId/check_in_members   今日签到
 * @apiName     GroupTodayCheckIn
 * @apiGroup    Group
 *
 * @apiParam    {Number}    [limitCount]   前多少个
 * @apiSuccess  {Number}    success
 * @apiSuccess  {Object}    data
 *
 */
router.get('/group/:groupId/check_in_members', auth.loginRequired, async (ctx, next) => {
    let res = await srv_wxgroup.getCheckInMembers(ctx.params.groupId, ctx.query.limitCount);
    ctx.body = {
        success:1,
        data: {
            count: res.length,
            members: res
        }
    }
});


/**
 * @api {get}  /group/:groupId/my_check_ins   我的签到
 * @apiName     GroupMyCheckIn
 * @apiGroup    Group
 *
 * @apiSuccess  {Number}    success
 * @apiSuccess  {Object}    data
 *
 */
router.get('/group/:groupId/my_check_ins', auth.loginRequired, async (ctx, next) => {
    let res = await GroupCheckIn.find({
        userID:ctx.state.user._id
    });
    res = _.map(res, x=>moment(x.created_date).format('lll'));
    ctx.body = {
        success:1,
        data: {
            count: res.length,
            list: res
        }
    }
});


/**
 * @api {get}  /group/:groupId/bonus   今日福利
 * @apiName     GroupTodayBonus
 * @apiGroup    Group
 *
 * @apiParam    {Number}    [limitCount]   前多少个
 * @apiSuccess  {Number}    success
 * @apiSuccess  {Object}    data
 *
 */
router.get('/group/:groupId/bonus', auth.loginRequired, async (ctx, next) => {
    let res = await srv_wxgroup.getCheckInMembers(ctx.params.groupId);
    auth.assert(ctx.query.god_bless_you || res.length > 9, "未满");
    res = await TodayBonusSchema.findOne().sort({created_date:-1});
    if(!res){
        res = await TodayBonusSchema.create({
            content:"empty"
        })
    }
    let ret = {
        content: res.content,
        date: moment(res.created_date).format('L')
    }
    ctx.body = {
        success:1,
        data:ret
    }
});
