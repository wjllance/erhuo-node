require('should');
let _ = require('lodash');
let utils = require('utility');
let superagent = require('superagent');
let config = require('../config');
let {User, AccessToken, Comment} = require('../models')
let moment = require('moment')
moment.locale('zh-cn');
let log4js = require('log4js');

let logger = log4js.getLogger('errorLogger');

const ERR_CODE = 985;



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
        return await access_token.save();
    }
}

let get_access_token = exports.get_access_token = async function()
{
    let accessToken = await AccessToken.findOne();

    if(!accessToken || moment(accessToken.expire_date).isBefore(moment().add(1, 'h')))
    {
        console.log("updating access token")
        accessToken = await updateAccessToken(accessToken)
        console.log(accessToken)
    }else{
        console.info(moment(accessToken.expire_date));
    }
    return accessToken.token
}
let sendReplyNotice = exports.sendReplyNotice = async function(comment_id) {

    let comment = await Comment.findOne({_id:comment_id}).populate('fromId').populate('goodsId');
    let touser = await User.findOne({_id:comment.toId || comment.goodsId.userID});
    let tid = String(touser._id);
    let fid = String(comment.fromId._id);
    console.log(comment.fromId._id)
    console.log(touser)
    if(touser.sa_openid == null ||  fid == tid){
        // console.log("no!!!!!!!!!");
        return ;
    }
    console.log("send notify to..."+touser.sa_openid)


    let access_token = await get_access_token();
    console.log(access_token);
    let post_url = "https://api.weixin.qq.com/cgi-bin/message/template/send?access_token="+access_token;
    let {text} = await superagent.post(post_url).send({
        touser: touser.sa_openid,
        template_id: "RZVd2BR7dSyhqzl__0xLmJIvobcg28wflBeWqszcUR0",
        miniprogram: {
            appid: config.APP_ID,
            pagepath: "pages/index/index"
        },
        data: {
            first: {
                value: "收到新的留言"
            },
            keyword2:{
                value: comment.goodsId.gname
            },
            keyword3:{
                value: comment.content
            },
            keyword4:{
                value: moment(comment.created_date).format('lll')
            },
            keyword5:{
                value: comment.fromId.nickName
            },
            remark:{
                value: "点击进入小程序回复"
            },
        }
    });
    let res = JSON.parse(text);
    console.log(res)
    return res

};

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
        let newly_inserted = await update_services_openids(res.data.openid)
        return {
            new: newly_inserted,
            next_openid: res.data.next_openid
        };
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
    // logger.info(sa_openids_exists)
    logger.info("sa openids, size"+ sa_openids.length)
    // logger.info(sa_openids)


    console.log("sa openids exists, size"+ sa_openids_exists.length)

    console.log("sa openids, size"+ sa_openids.length)

    let count = 0;
    for (let i = 0; i < sa_openids.length; i++) {
        if(sa_openids_exists.indexOf(sa_openids[i]) < 0){
            user_list.push({openid:sa_openids[i]})
            if(user_list.length == 100){
                await doit(user_list)
                user_list = []
            }
            count += 1
        }
    }
    if(user_list.length > 0){
        await doit(user_list)
    }
    return count;
}


//根据openid从服务号获取用户基本信息并存入数据库
let update_userInfo_by_openId = exports.update_userInfo_by_openId = async function(openid){
    let access_token = await get_access_token();
    console.log(access_token);
    let get_url = "https://api.weixin.qq.com/cgi-bin/user/info";
    let {text} = await superagent.get(get_url).query({
        access_token: access_token,
        openid: openid,
        lang:'zh_CN'
    });
    let res = JSON.parse(text);
    if(res.errcode){
        logger.error(res);
        console.log(res);

        let err = new Error(res.errmsg);
        err.status = ERR_CODE;
        throw err;
    }else{
        let userInfo=
        {
            sa_openid: res.openid,
            nickName: res.nickname,
            gender: res.sex,
            avatarUrl:res.headimgurl,
            city:res.city,
            province:res.province,
            country: res.country,
            language: res.language,
            unionid: res.unionid
        };
        console.log(userInfo);
        let unionid = userInfo.unionid;
        await User.findOneAndUpdate({unionid: unionid}, userInfo, {new: true, upsert: true});
    }
};
