require('should');
let _ = require('lodash');
let utils = require('utility');
let superagent = require('superagent');
let config = require('../config');
let {User, AccessToken} = require('../models')

let log4js = require('log4js');

let logger = log4js.getLogger('errorLogger');

const ERR_CODE = 985;

let accessToken = null;


let updateAccessToken = async function (access_token) {
    if(access_token==null){
        access_token = new AccessToken({type:0})
    }
    console.log(access_token);

    let api_url = "https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential"
    let {text} = await superagent.get(api_url).query({
        grant_type: "client_credential",
        appid: config.SA_APP_ID,
        secret: config.SA_SECRET
    });
    console.log(text);
    let res = JSON.parse(text);
    if(res.errcode){
        console.log(res);
        let err = new Error(res.errmsg);
        err.status = ERR_CODE;
        throw err;
    }else{
        access_token.token = res.access_token;
        access_token.expire_date = Date.now()+res.expires_in*1000;
        await access_token.save();
    }
}

let get_access_token = exports.get_access_token = async function()
{
    if(accessToken == null){
        accessToken = await AccessToken.findOne();
        if(!accessToken || accessToken.expire_date < Date.now())
        {
            await updateAccessToken(accessToken)
        }
    }
    return accessToken.token
}
let sendReplyNotice = exports.sendReplyNotice = async function(touser, info) {
    let access_token = await get_access_token();
    let post_url = "https://api.weixin.qq.com/cgi-bin/message/template/send?access_token="+access_token;
    let res = await superagent.post(post_url).send({
        touser: touser,
        template_id: "pj1M_E5T2TXvxGU1dzNx4ab5GavuY-5TizlP8vKOjSg",
        miniprogram: {
            appid: config.APP_ID,
            pagepath: "index"
        },
        data: {}
    });
    return res

}

let update_service_account_userid = exports.update_service_account_userid = async function(next_openid){


    let access_token = await get_access_token();
    console.log(access_token)
    let get_url = "https://api.weixin.qq.com/cgi-bin/user/get"
    let {text} = await superagent.get(get_url).query({
        access_token: access_token,
        next_openid: next_openid
    })
    let res = JSON.parse(text)

    if(res.errcode){
        console.log(res)
        let err = new Error(res.errmsg);
        err.status = ERR_CODE;
        throw err;
    }else{
        return await update_services_openids(res.data.openid)
        return res.data.next_openid;
    }
}

let doit = async function(user_batch){

    let access_token = await get_access_token();
    let api_url = "https://api.weixin.qq.com/cgi-bin/user/info/batchget?access_token="+access_token;
    let {text} = await superagent.post(api_url).send({
        user_list: user_batch
    });
    let res = JSON.parse(text);
    logger.level = 'info';
    logger.info("update user sa openid, size"+ res.user_info_list.length)
    // logger.info(res)
    console.log("update user sa openid, size"+ res.user_info_list.length)

    for (let i = 0; i < res.user_info_list.length; i++) {
        let info = {
            sa_openid: res.user_info_list[i].openid,
            unionid: res.user_info_list[i].unionid,
            nickName: res.user_info_list[i].nickname,
            avatarUrl: res.user_info_list[i].headimgurl
        }
        logger.info(info)
        let unionid = info.unionid;
        await User.findOneAndUpdate({unionid: unionid}, info, {new: true, upsert: true});
    }
}

let update_services_openids = exports.update_services_openids = async function(sa_openids){
    let user_list = [];
    let sa_openids_exists = await User.find({sa_openid: {$ne: null}}, {sa_openid:1, _id:0});
    sa_openids_exists = sa_openids_exists.map(y=>y.sa_openid);
    logger.level = 'info';
    logger.info("sa openids exists, size"+ sa_openids_exists.length)
    logger.info(sa_openids_exists)
    logger.info("sa openids, size"+ sa_openids.length)
    logger.info(sa_openids)


    console.log("sa openids exists, size"+ sa_openids_exists.length)

    console.log("sa openids, size"+ sa_openids.length)

    for (let i = 0; i < sa_openids.length; i++) {
        if(sa_openids_exists.indexOf(sa_openids[i]) < 0){
            user_list.push({openid:sa_openids[i]})
            if(user_list.length == 100){
                await doit(user_list)
                user_list = []
            }
        }
    }
    if(user_list.length > 0){
        await doit(user_list)
    }

}


