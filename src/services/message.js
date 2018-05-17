require('should');
let _ = require('lodash');
let utils = require('utility');
let superagent = require('superagent');
let config = require('../config');
let log4js = require('log4js');
let logger = log4js.getLogger('errorLogger');
let tools = require("./tools");
let moment = require('moment');
moment.locale('zh-cn');
//-------------------------------------------
let {User, UserFormid} = require('../models');
let srv_wechat = require("./wechat");

let TEMPLATE_MESSAGE_ID = "bMvVQ3VWf_3-qC9lTmwaWVcGdYK2Qi7eWLoq4ssapkI";


exports.sendTemplate = async (touser_id, content, fromuser) => {
    let touser = await User.findById(touser_id);
    let formid = await UserFormid.findOne({
        user_id: touser_id,
        expire_date: {$gt: moment()},
        used: {$ne: 1}
    }).sort({expire_date:1});
    console.log(formid);
    if(!formid){
        logger.warn("temp id not enough", fromuser, touser, content);
        console.error("temp id not enough", fromuser, touser, content);
        return null;
    }
    let data = {
        keyword1: {
            value: content
        },
        keyword2: {
            value: touser.nickName
        }
    };
    formid.used = 1;
    await formid.save();
    return await srv_wechat.sendMinaTempMsg(touser.openid, TEMPLATE_MESSAGE_ID, formid.formid, data, "pages/news/news");
}