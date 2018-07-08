require('should');
let Router = require('koa-router');
const moment = require('moment');
let _ = require('lodash');

let utils = require('utility');
let log4js = require('log4js');
let logger = log4js.getLogger('errorLogger');
let config = require('../config');
let auth = require('../services/auth');



const router = module.exports = new Router();

router.get('/admin/reject_goods', auth.loginRequired, async (ctx, next) => {

    let mygroups = await srv_wxgroup.getGroupList(ctx.state.user);

    ctx.body = {
        success:1,
        data: mygroups
    }
});