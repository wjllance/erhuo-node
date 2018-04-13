require('should');
let _ = require('lodash');
let utils = require('utility');
let superagent = require('superagent');
let config = require('../config');
let {User, AccessToken} = require('../models')



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
        await access_token.save();
    }
}

let get_access_token = exports.get_access_token = async function()
{
    let access_token = await AccessToken.findOne({type:0});
    console.log("acces_token");
    console.log(access_token);
    if(!access_token || access_token.expire_date < Date.now())
    {
        await updateAccessToken(access_token)
    }
    return access_token.token
}
let sendReplyNotice = exports.sendReplyNotice = async function(touser, info) {
    let access_token = get_access_token();
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


    let access_token = get_access_token();
    return access_token;

    let get_url = "https://api.weixin.qq.com/cgi-bin/user/get"
    let {text} = await superagent.get(get_url).query({
        access_token: access_token,
        next_openid: next_openid
    })
    let res = JSON.parse(text)

    console.log(res)
    if(res.errcode){
        return res;
    }else{
        await update_services_openids(res.data.openid)
        return res.data.next_openid;
    }
}

let doit = async function(user_batch){

    let api_url = "https://api.weixin.qq.com/cgi-bin/user/info/batchget?access_token="+get_access_token();
    let {text} = await superagent.post(api_url).send({
        user_list: user_batch
    });
    let res = JSON.parse(text);
    console.log(res)
    if(res.user_info_list){
        res.user_info_list.map(user=>{
            let info = {
                openid: user.openid,
                unionid: user.unionid,
                nickName: user.nickname,
                avatarUrl: user.headimgurl
            }
            let openid = user.openid;
            let unionid = user.unionid;
            User.findOneAndUpdate({unionid: unionid}, info, {new: true, upsert: true});
        })
    }
}

let update_services_openids = exports.update_services_openids = async function(sa_openids){
    let user_list = [];
    let sa_openids_exists = await User.find({sa_openid: {$ne: null}}, {sa_openid:1, _id:0});
    sa_openids_exists = sa_openids_exists.map(y=>y.sa_open_id);
    console.log("sa openids exists")
    console.log(sa_openids_exists)
    console.log("sa openids")
    console.log(sa_openids)
    for (let i = 0; i < sa_openids.length; i++) {
        if(sa_openids_exists.indexOf(sa_openids[i]) < 0){
            user_list.push({openid:sa_openids[i]})
            console.log(user_list)
            if(user_list.length == 100){
                await doit(user_list)
                user_list = []
            }
        }
    }
    if(user_list.length > 0){
        await doit(user_list)
    }
    console.log(user_list);

}


