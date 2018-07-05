
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
let srv_bargain = require('../services/bargain');
let srv_wxgroup = require('../services/wxgroup');
let srv_goods = require('../services/goods');
let {Order, Goods, Bargain, wxGroup} = require('../models');

const router = module.exports = new Router();


/**
 * @api {get} /bargain/goods/:goods_id  砍价商品详情？
 * @apiName     BargainGoods
 * @apiGroup    Bargain
 *
 *
 * @apiParam    {String}    bargainId
 *
 * @apiSuccess  {Number}    success
 * @apiSuccess  {Object}    data
 *
 */
router.get('/group/my', auth.loginRequired, async (ctx, next) => {

});


router.del('/group/:openGId', auth.loginRequired, async (ctx, next)=>{

});


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
            created_date:-1
        };
    }else{
        sorti = {
            updated_date:-1
        };
    }
    console.log(condi, sorti);


    let gusers = await srv_wxgroup.getMembers(group._id);

    console.log("group users...", guserids);

    condi.userID = {
        $in: _.map(gusers, u=>u._id)
    };

    let user = ctx.state.user;
    if(user){ //not other
        condi.$or=[{
            glocation:user.location
        },{
            glocation:0
        }]
    }
    let ret = await srv_goods.goodsListV2(user, pageNo, pageSize, condi, sorti);

    ctx.body = {
        success:1,
        data:ret
    }
});

router.post('/group/join', auth.loginRequired, async (ctx, next) => {

    let params = ctx.request.body;
    let condi = {openGId: params.openGId};
    let data = {name: params.groupName};
    let wxgroup = await wxGroup.findOneAndUpdate(condi, data, {new:true, upsert:true});

    await srv_wxgroup.createUserGroup(wxgroup, ctx.state.user);

    ctx.body = {
        success:1,
        data: wxgroup._id
    }
});



router.get('/group/:groupId/members', auth.loginRequired, async (ctx, next) => {

    let ret = await srv_wxgroup.getMembers(ctx.params.groupId);
    ctx.body = {
        success:1,
        data:ret
    }
});


