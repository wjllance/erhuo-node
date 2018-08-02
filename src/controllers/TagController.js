
require('should');
let Router = require('koa-router');

let _ = require('lodash');

let utils = require('utility');
let log4js = require('log4js');
let logger = log4js.getLogger('errorLogger');
let config = require('../config');
let auth = require('../services/auth');
let wechat = require('../services/wechat');
let tagService = require('../services/TagService');
let srv_bargain = require('../services/bargain');
let {Order, Goods, UserTag, TagLike} = require('../models');

const router = module.exports = new Router();

//tag detail
router.get('/tags', auth.loginRequired, async(ctx, next) => {
    let userId = ctx.query.user_id;
    // auth.loginRequired();
    let res = await tagService.detailList(userId, ctx.state.user);
    ctx.body = {
        success:1,
        data: res
    }
});


//tag post
router.post('/tags', auth.loginRequired, async (ctx, next) => {
    let name = ctx.request.body.name;
    auth.assert(name, "标签内容不能为空");
    let res = await tagService.userPostTag(ctx.state.user, name);
    ctx.body = {
        success:1,
        data: res
    }
});

router.delete('/tags/:id', auth.loginRequired, async (ctx, next) => {
    let user_tag_id = ctx.params.id;
    let userTag = await UserTag.findById(user_tag_id);
    auth.assert(userTag, "标签不存在");
    let user = ctx.state.user;
    auth.assert(user.is_admin || userTag.userID.toString() === user._id.toString(), "无权限");
    userTag.deleted_date = new Date();
    userTag.save();
    ctx.body = {
        success:1,
    }

});


router.post('/tags/like', auth.loginRequired, async(ctx, next) => {


    let userTag = await UserTag.findById(ctx.request.body.id);
    auth.assert(userTag, "用户标签不存在");

    let tagLike = await TagLike.findOne({
        userID: ctx.state.user._id,
        user_tag_id: userTag._id,
    });

    auth.assert(!tagLike || tagLike.deleted_date, "点过了");

    tagLike = await TagLike.findOneAndUpdate({
        userID: ctx.state.user._id,
        user_tag_id: userTag._id
    }, {
        to_user_id: userTag.userID,
        deleted_date: null,
        updated_date: new Date()
    }, {new:true, upsert:true});

    userTag.like_num ++;
    userTag.save();
    ctx.body = {
        success: 1,
        data: tagLike
    }
});

router.post('/tags/unlike', auth.loginRequired, async(ctx, next) => {
    let userTag = await UserTag.findById(ctx.request.body.id);
    auth.assert(userTag, "用户标签不存在");

    let tagLike = await TagLike.findOne({
        userID: ctx.state.user._id,
        user_tag_id: userTag._id,
    });

    auth.assert(tagLike && !tagLike.deleted_date, "没赞过");
    tagLike.deleted_date = new Date();
    tagLike.save();

    userTag.like_num --;
    userTag.save();
    ctx.body = {
        success: 1,
        data: tagLike
    }
});
