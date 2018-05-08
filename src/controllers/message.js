
require('should');
let Router = require('koa-router');

let _ = require('lodash');

let utils = require('utility');
let log4js = require('log4js');
let logger = log4js.getLogger('errorLogger');
let config = require('../config');
let auth = require('../services/auth');
let wechat = require('../services/wechat');
let srv_order = require('../services/order');
let superagent = require('superagent');
const router = module.exports = new Router();

// let TimRestAPI = require('../libs/tlssdk/lib/TimRestApi.js');
// let tlsapi = new TimRestAPI(require('../libs/tlssdk/config/config'));


let { User } = require('../models');


/*
router.get('/message/test_multi_import', async (ctx, next) => {

    let users = await User.find({
        tls_imported: {$ne: true}
    }).limit(50);
    auth.assert(users.length > 0, "没有");
    let env = config.ENV;
    let param = _.map(users, u => u.tls_id());

    let serviceName = 'im_open_login_svc';
    let commandName = 'multiaccount_import';
    let reqBody = {Accounts: param};
    console.log(reqBody);

    await tlsapi.initAsync();

    let res = await tlsapi.requestAsync(serviceName, commandName, reqBody);
    if(res.ActionStatus == "OK") {

        for (var i = 0; i < users.length; i++) {
            if (users[i]._id + "dev" in res.FailAccounts) {
                console.log("fail", users[i])
            } else {
                users[i].tls_imported = true;
                console.log("imported", users[i]);
                await users[i].save();
            }
        }

        res.count = users.length - res.FailAccounts.length;
    }

    ctx.body = {
        success:1,
        data:res
    }
});
*/

let api_prefix = "https://eg38eufh.api.lncld.net/1.1/rtm/"

router.get('/message/history/', async(ctx, next)=>{
    let param = _.pick(ctx.query, ['convid', 'msgid', 'timestamp']);
    console.log(param);
    let res = await superagent
        .get(api_prefix+"messages/history")
        .query(param)
        .set("X-LC-Id", config.LEAN_APPID)
        .set("X-LC-Key", config.LEAN_MASTERKEY);
    console.log(res.text);
    logger.info(res.text);
    ctx.body = {
        success:1,
        data:eval(res.text)
    }
});

