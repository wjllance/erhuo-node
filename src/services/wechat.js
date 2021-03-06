require('should');
let _ = require('lodash');
let utils = require('utility');
let superagent = require('superagent');
let config = require('../config');
let log4js = require('log4js');
let logger = log4js.getLogger('errorLogger');
let moment = require('moment');
moment.locale('zh-cn');
/*-----------------------------------------------*/
let auth = require('./auth');
const xml2js = require('xml2js');
let fs = require('fs');
let path = require('path');
let { User, AccessToken, Comment, Order } = require('../models');
const tenpay = require('tenpay');
const pay_config = {
    appid: config.APP_ID,
    mchid: config.MCH_ID,
    partnerKey: config.API_KEY,
    pfx: require('fs').readFileSync(config.CERT_PATH + "apiclient_cert.p12"),
    notify_url: config.SERVER.URL_PREFIX + '/wechat/notify',
    // spbill_create_ip: 'ip'
};
// const pay_config = {
//     appid: "wxeedf8d0cba505192",
//     mchid: "1491171192",
//     partnerKey: "OinKiHAr51RyvfCdjSECVCQ91OIC1SJM",
//     pfx: require('fs').readFileSync(config.CERT_PATH+"apiclient_cert.pem"),
//     notify_url: 'notify',
//     // spbill_create_ip: 'ip'
// };
const api = new tenpay(pay_config);
const ERR_CODE = 985;


const TYPE_SA = exports.TYPE_SA = 0;
const TYPE_MINA = exports.TYPE_MINA = 1;


let updateAccessToken = async function (access_token) {

    let query_sa = {
        grant_type: "client_credential",
        appid: config.SA_APP_ID,
        secret: config.SA_SECRET,
    };
    let query_mina = {
        grant_type: "client_credential",
        appid: config.APP_ID,
        secret: config.APP_SECRET,
    };
    let api_url = "https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential";
    let { text } = await superagent.get(api_url)
        .query(access_token.type == TYPE_SA ? query_sa : query_mina);

    logger.info(text);
    console.log(text);

    let res = JSON.parse(text);

    auth.assert(!res.errcode, res.errmsg);
    access_token.token = res.access_token;
    access_token.expire_date = moment().add(5, 'm');
    return await access_token.save();
};

let get_access_token = exports.get_access_token = async function (type) {
    let token_type = type || 0;
    let accessToken = await AccessToken.findOne({ type: token_type });
    if (!accessToken) {
        accessToken = new AccessToken({
            type: token_type,
            expire_date: moment().subtract(2, 'h'),
        });
    }
    if (moment(accessToken.expire_date).isBefore()) {
        logger.info("updating access token");
        // console.log("updating access token")
        accessToken = await updateAccessToken(accessToken);
    }
    logger.info(accessToken);
    return accessToken.token;
};
let sendReplyNotice = exports.sendReplyNotice = async function (comment_id) {

    let comment = await Comment.findOne({ _id: comment_id }).populate('fromId').populate('goodsId');
    let touser = await User.findOne({ _id: comment.toId || comment.goodsId.userID });
    let tid = String(touser._id);
    let fid = String(comment.fromId._id);
    logger.info(comment.fromId._id);
    logger.info(touser);
    if (touser.sa_openid == null || fid == tid) {
        // console.log("no!!!!!!!!!");
        logger.info("not sending notify");
        if (touser.sa_openid == null) {
            logger.error(comment);
        }
        return;
    }
    console.log("send notify to..." + touser.sa_openid);


    let access_token = await get_access_token();
    console.log(access_token);
    let post_url = "https://api.weixin.qq.com/cgi-bin/message/template/send?access_token=" + access_token;
    let { text } = await superagent.post(post_url).send({
        touser: touser.sa_openid,
        template_id: "RZVd2BR7dSyhqzl__0xLmJIvobcg28wflBeWqszcUR0",
        miniprogram: {
            appid: config.APP_ID,
            pagepath: "pages/index/index",
        },
        data: {
            first: {
                value: "??????????????????",
            },
            keyword2: {
                value: comment.goodsId.gname,
            },
            keyword3: {
                value: comment.content,
            },
            keyword4: {
                value: moment(comment.created_date).format('lll'),
            },
            keyword5: {
                value: comment.fromId.nickName,
            },
            remark: {
                value: "???????????????????????????",
            },
        },
    });
    let res = JSON.parse(text);
    console.log(res);
    return res;

};



let sendReplyNoticeOnce =  async function (touser_id, fromuser, messagetype) {
    if(messagetype == "0"){

        console.log(`send notify to... ${touser_id}, type: ${messagetype}`);
        let access_token = await get_access_token(0);
        console.log(access_token);
        let post_url = "https://api.weixin.qq.com/cgi-bin/message/template/send?access_token=" + access_token;
        let { text } = await superagent.post(post_url).send({
            touser: touser_id,
            template_id: "RZVd2BR7dSyhqzl__0xLmJIvobcg28wflBeWqszcUR0",
            data: {
                first: {
                    value: "?????????????????????????????????,?????????????????????",
                },
                keyword2: {
                    value: fromuser.nickName,
                },
            },
        });
        let res = JSON.parse(text);
        console.log(res);
        return res;


    }else if(messagetype == "1"){

        console.log(`send notify to... ${touser_id}, type: ${messagetype}`);
        let access_token = await get_access_token(0);
        console.log(access_token);
        let post_url = "https://api.weixin.qq.com/cgi-bin/message/template/send?access_token=" + access_token;
        let { text } = await superagent.post(post_url).send({
            touser: touser_id,
            template_id: "RZVd2BR7dSyhqzl__0xLmJIvobcg28wflBeWqszcUR0",
            data: {
                first: {
                    value: "??????????????????????????????????????????????????????",
                },
                keyword2: {
                    value: fromuser.nickName,
                }
            },
        });
        let res = JSON.parse(text);
        console.log(res);
        return res;
    }
}

exports.sendReplyNotice2 = async function (model,messagetype) {

    let sa_openids = [
        'osY9v0Zun4ECWgXKUR_fz9727U0A',  //fr
        'osY9v0UGaMn5byuA_bPA1_hKMVPQ',  //xt
        'osY9v0avBihK1OEKug6SRPEZ04VA',  //xy
        'osY9v0UbwlKnA9O_rdyIp5pac1Go', //wjl,
        'osY9v0U3cqAoymtzH8aRO6TN0Mmc', //hw
    ];

    for (let i = 0; i < sa_openids.length; i++){
        await sendReplyNoticeOnce(sa_openids[i], model, messagetype);
    }

};

let sendMinaTempMsg = exports.sendMinaTempMsg = async (touser, template_id, form_id, data, page, color, emphasis_keyword) => {
    let access_token = await get_access_token(TYPE_MINA);
    console.log(access_token);
    let post_url = "https://api.weixin.qq.com/cgi-bin/message/wxopen/template/send?access_token=" + access_token;
    let { text } = await superagent.post(post_url).send({
        touser: touser,
        template_id: template_id,
        page: page,
        data: data,
        form_id: form_id,
    });
    let res = JSON.parse(text);
    console.log(res);
    return res;
};

let update_service_account_userid = exports.update_service_account_userid = async function (next_openid) {


    let access_token = await get_access_token();
    console.log(access_token);
    let get_url = "https://api.weixin.qq.com/cgi-bin/user/get";
    let { text } = await superagent.get(get_url).query({
        access_token: access_token,
        next_openid: next_openid,
    });
    let res = JSON.parse(text);

    auth.assert(!res.errcode, res.errmsg);
    let newly_inserted = await update_services_openids(res.data.openid);
    return {
        new: newly_inserted,
        next_openid: res.data.next_openid,
    };
};

let doit = async function (user_batch) {

    let access_token = await get_access_token();
    let api_url = "https://api.weixin.qq.com/cgi-bin/user/info/batchget?access_token=" + access_token;
    let { text } = await superagent.post(api_url).send({
        user_list: user_batch,
    });
    let res = JSON.parse(text);
    logger.level = 'info';
    logger.info("update user sa openid, size" + res.user_info_list.length);
    // logger.info(res)
    console.log("update user sa openid, size" + res.user_info_list.length);

    for (let i = 0; i < res.user_info_list.length; i++) {
        let info = {
            sa_openid: res.user_info_list[i].openid,
            unionid: res.user_info_list[i].unionid,
            nickName: res.user_info_list[i].nickname,
            avatarUrl: res.user_info_list[i].headimgurl,
        };
        logger.info(info);
        let unionid = info.unionid;
        await User.findOneAndUpdate({ unionid: unionid }, info, { new: true, upsert: true });
    }
};

let update_services_openids = exports.update_services_openids = async function (sa_openids) {
    let user_list = [];
    let sa_openids_exists = await User.find({ sa_openid: { $ne: null } }, { sa_openid: 1, _id: 0 });
    sa_openids_exists = sa_openids_exists.map(y => y.sa_openid);
    logger.level = 'info';
    logger.info("sa openids exists, size" + sa_openids_exists.length);
    // logger.info(sa_openids_exists)
    logger.info("sa openids, size" + sa_openids.length);
    // logger.info(sa_openids)


    console.log("sa openids exists, size" + sa_openids_exists.length);

    console.log("sa openids, size" + sa_openids.length);

    let count = 0;
    for (let i = 0; i < sa_openids.length; i++) {
        if (sa_openids_exists.indexOf(sa_openids[i]) < 0) {
            user_list.push({ openid: sa_openids[i] });
            if (user_list.length == 100) {
                await doit(user_list);
                user_list = [];
            }
            count += 1;
        }
    }
    if (user_list.length > 0) {
        await doit(user_list);
    }
    return count;
};


//??????openid??????????????????????????????????????????????????????
let update_userInfo_by_openId = exports.update_userInfo_by_openId = async function (openid) {
    let access_token = await get_access_token();
    console.log(access_token);
    let get_url = "https://api.weixin.qq.com/cgi-bin/user/info";
    let { text } = await superagent.get(get_url).query({
        access_token: access_token,
        openid: openid,
        lang: 'zh_CN',
    });
    let res = JSON.parse(text);
    auth.assert(!res.errcode, res.errmsg);
    let userInfo =
        {
            sa_openid: res.openid,
            nickName: res.nickname,
            gender: res.sex,
            avatarUrl: res.headimgurl,
            city: res.city,
            province: res.province,
            country: res.country,
            language: res.language,
            unionid: res.unionid,
        };
    console.log(userInfo);
    let unionid = userInfo.unionid;
    await User.findOneAndUpdate({ unionid: unionid }, userInfo, { new: true, upsert: true });
};

exports.dealText = function (responseMSg, fromUserName, toUserName) {
    let ret_xml = '<xml>';
    ret_xml += '<FromUserName><![CDATA[' + fromUserName + ']]></FromUserName>';
    ret_xml += '<ToUserName><![CDATA[' + toUserName + ']]></ToUserName>';
    ret_xml += '<CreateTime>' + new Date().getTime() + '</CreateTime>';
    ret_xml += '<MsgType><![CDATA[text]]></MsgType>';
    ret_xml += '<Content><![CDATA[' + responseMSg + ']]></Content></xml>';
    return ret_xml;
};


exports.qrcode = async (mina_scene, mina_path) => {

    let api_url = "https://api.weixin.qq.com/wxa/getwxacodeunlimit?access_token=" + await get_access_token(TYPE_MINA);

    let ts = moment().millisecond().toString();
    let filename = config.PUBLIC.images + '/qr_' + ts + '.png';
    let ret = path.join(config.PUBLIC.root, filename);
    let stream = fs.createWriteStream(ret);
    await superagent.post(api_url).send({
        scene: mina_scene,
        page: mina_path,
        width: 60,
    }).pipe(stream);
    return filename;
    // let res = JSON.parse(text);
    // console.log(res);
    // return res;
};


exports.getPayParamsV2 = async (params) => {

    let res = await api.getPayParams(params);
    console.log(res);
    return res;
};

exports.getPayParams = async (order_id) => {
    let order = await Order.findOne({ _id: order_id }).populate('buyer');
    console.log(pay_config);
    let params = {
        out_trade_no: order.sn,
        body: order.goodsInfo.gname,
        total_fee: order.price * 100,
        openid: order.buyer.openid,
    };
    // if(config.ENV == 'local'){
    //     params.total_fee = 1;
    // }
    let res = await api.getPayParams(params);
    console.log(res);
    return res;
};

exports.queryOrder = async (order_id) => {
    let order = await Order.findOne({ _id: order_id });

    let res = await api.orderQuery({
        out_trade_no: order.sn,
    });
    console.log(res);
};


exports.checkMchSig = (data) => {
    let sig = data.sign;
    _.unset(data, 'sign');
    let keys = _.keys(data).sort();
    let paramArr = keys.map(k => {
        return k + "=" + data[k][0];
    });
    paramArr.push('key=' + config.API_KEY);
    let signed = utils.md5(paramArr.join('&')).toUpperCase();
    return sig == signed;
};


exports.withdraw = async (partner_trade_no, openid, amount) => {
    let param = {
        check_name: "NO_CHECK",
        partner_trade_no: utils.md5(partner_trade_no.toString()),
        openid: openid,
        amount: amount,
        desc: "???????????????",
    };
    logger.info(param);
    let res = await api.transfers(param);
    console.log(res);
    if (res.return_code == "SUCCESS" && res.result_code == "SUCCESS") {
        return true;
    } else {
        logger.error(res);
        auth(false, "????????????");
    }
    return res;
};

exports.refund = async function (sn) {
    //TODO....
    console.log("refunding?????????");
};

exports.mpmsg = async (openid, msg) => {
    let api_url = "https://api.weixin.qq.com/cgi-bin/message/custom/send?access_token=" + await get_access_token(TYPE_MINA);
    let { text } = await superagent.post(api_url).send({
        touser: openid,
        msgtype: "text",
        text: { content: msg },
    });
    let res = JSON.parse(text);
    console.log(res);
};

