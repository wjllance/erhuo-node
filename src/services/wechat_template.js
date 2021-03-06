require("should");
let _ = require("lodash");
let utils = require("utility");
let superagent = require("superagent");
let config = require("../config");
let log4js = require("log4js");
let logger = log4js.getLogger("errorLogger");
let tools = require("./tools");
let moment = require("moment");
moment.locale("zh-cn");
/*-----------------------------------------------*/
let auth = require("./auth");
const xml2js = require("xml2js");
let fs = require("fs");
let path = require("path");
var qs = require('qs');
let { User, AccessToken, Comment, Order, UserFormid } = require("../models");
let srv_wechat = require("./wechat");


let sendMinaTempMsg = exports.sendMinaTempMsg = async (touser, template_id, form_id, data, page, color, emphasis_keyword) => {
    let access_token = await srv_wechat.get_access_token(srv_wechat.TYPE_MINA);
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
    logger.info("MINA NOTIFY", res);
    return res;
};

let getFormid = async (userid) => {
    let formid = await UserFormid.findOne({
        user_id: userid,
        expire_date: { $gt: moment() },
        used: { $ne: 1 },
    }).sort({ expire_date: 1 });
    console.log(formid);
    if (!formid) {
        console.error("没了。。");
        return null;
    }
    // auth.assert(formid, "因为不可抗力，消息提醒发送失败", config.CONSTANT.ERR_CODE.MSG_FAIL);
    return formid;
};

exports.sendPaidTemplate = async (order) => {
    let seller_id = order.seller._id || order.seller;
    let buyer_id = order.buyer._id || order.buyer;

    let touser = await User.findById(seller_id);
    let buyer = await  User.findById(buyer_id);
    let formid = await getFormid(touser._id);
    if (!formid) {
        return false;
    }
    let template_id = "YguybxI3FIF3xffJsWQX6uvMrREN-6--76LLenJ7JMI";
    let page = "pages/news/news";
    let data = {
        //温馨提示
        keyword1: {
            value: "订单已支付，请尽快与买家约定时间地点进行交易",
        },
        //物品名称
        keyword2: {
            value: order.goodsInfo.gname,
        },
        //订单号
        keyword3: {
            value: order.sn,
        },
        //订单状态
        keyword4: {
            value: "已支付",
        },
        //订单金额
        keyword5: {
            value: order.price,
        },
        //收货人
        keyword6: {
            value: buyer.nickName,
        },
        //收货人电话
        keyword7: {
            value: "手机号正在接入中",
        },
        keyword8: {
            value: moment().format("lll"),
        },
    };

    formid.used = 1;
    await sendMinaTempMsg(touser.openid, template_id, formid.formid, data, page);
    await formid.save();
    return true;
};

//支付成功回调的时候 发送短信
exports.sendCode = async (order) => {
    let seller_id = order.seller._id || order.seller;
    let buyer_id = order.buyer._id || order.buyer;

    let touser = await User.findById(seller_id);
    let buyer = await  User.findById(buyer_id);

    let YUNPIAN_APIKEY = config.YUNPIAN_KEY;
    let phoneNum = touser.phoneNumber;
    //发送请求
    console.log("发送短信", phoneNum);
    let buyPhone = buyer.phoneNumber;
    buyPhone = buyPhone.substr(0, 3) + '****' + buyPhone.substr(7);
    let getAccessUrl = `https://sms.yunpian.com/v2/sms/tpl_single_send.json`;
    let tpl_value = {
        '#code#': order.goodsInfo.gname,
        '#username#': buyer.nickName,
        '#tel#': buyPhone,
        '#order#': order.sn,
    };
    let { text } = await superagent.post(getAccessUrl)
        .type('application/x-www-form-urlencoded; charset=UTF-8')
        .send(
            {
                'apikey': YUNPIAN_APIKEY,
                'mobile': phoneNum,
                'tpl_id': 2600192,
                'tpl_value': qs.stringify(tpl_value),
            },
        );
    let parse = JSON.parse(text);
    console.log("状态码" + parse.code + "=======" + parse.msg);
};

//买家对商品发起第一条消息
exports.sendBuy = async (touser) => {
    let YUNPIAN_APIKEY = config.YUNPIAN_KEY;
    let phoneNum = touser.phoneNumber;
    //发送请求
    console.log("发送短信", phoneNum);
    let getAccessUrl = 'https://sms.yunpian.com/v2/sms/tpl_single_send.json';
    let { text } = await superagent.post(getAccessUrl)
        .type('application/x-www-form-urlencoded; charset=UTF-8')
        .send(
            {
                'apikey': YUNPIAN_APIKEY,
                'mobile': phoneNum,
                'tpl_id': 2602120,
            },
        );
    let parse = JSON.parse(text);
    console.log("状态码" + parse.code + "=======" + parse.msg);
};

exports.confirmReceipt = async (order) => {
    let seller_id = order.seller._id || order.seller;
    let buyer_id = order.buyer._id || order.buyer;

    let touser = await User.findById(seller_id);
    let buyer = await  User.findById(buyer_id);
    let formid = await getFormid(touser._id);
    if (!formid) {
        return false;
    }
    let template_id = "h-AKhqlnkoDY9GdfRTylKd6gF1bd8KXfoVQW1uDMk5A";
    let page = "pages/news/news";
    let data = {
        //温馨提示
        keyword1: {
            value: "买家已收货，为确保双方权益，订单金额72小时之后方可提现",
        },
        //订单状态
        keyword2: {
            value: "已收货",
        },
        //订单号
        keyword3: {
            value: order.sn,
        },
        //订单金额
        keyword4: {
            value: order.price,
        },
        //物品名称
        keyword5: {
            value: order.goodsInfo.gname,
        },
        //收货人
        keyword6: {
            value: buyer.nickName,
        },
        //收货人电话
        keyword7: {
            value: "手机号正在接入中",
        },
        keyword8: {
            value: moment().format("lll"),
        },
    };

    formid.used = 1;
    await sendMinaTempMsg(touser.openid, template_id, formid.formid, data, page);
    await formid.save();
    return true;
};


exports.moneyArrive = async (order) => {
    let seller_id = order.seller._id || order.seller;

    let touser = await User.findById(seller_id);
    let formid = await getFormid(touser._id);
    if (!formid) {
        return false;
    }
    let template_id = "GUJN0AyeyDJjvN6rwSNg_b3HnuzOohBxKkDBGonZGW0";
    let page = "pages/news/news";
    let data = {
        //温馨提示
        keyword1: {
            value: "订单金额已到账，可进入我的钱包提现",
        },
        //商品名称
        keyword2: {
            value: order.goodsInfo.gname,
        },
        //入账金额
        keyword4: {
            value: order.price,
        },
        //入账时间
        keyword5: {
            value: moment().format("lll"),
        },
    };

    formid.used = 1;
    await sendMinaTempMsg(touser.openid, template_id, formid.formid, data, page);
    await formid.save();
    return true;
};


exports.refundApply = async (order, message) => {
    let seller_id = order.seller._id || order.seller;
    let buyer_id = order.buyer._id || order.buyer;

    let touser = await User.findById(seller_id);
    let buyer = await  User.findById(buyer_id);
    let formid = await getFormid(touser._id);
    if (!formid) {
        return false;
    }
    let template_id = "8r3D3uYC9Suj-W_Ri4WdupT3t7zO5hz4oaCdBVdhp6M";
    let page = "pages/news/news";
    let data = {
        //温馨提示
        keyword1: {
            value: message||"买家申请退货，请及时处理退货申请或联系客服拒绝退货",
        },
        //订单编号
        keyword2: {
            value: order.sn,
        },
        //商品名称
        keyword3: {
            value: order.goodsInfo.gname,
        },
        //退款金额
        keyword4: {
            value: order.price,
        },
        //退款人
        keyword5: {
            value: buyer.nickName,
        },
        //退款人手机
        keyword6: {
            value: "手机号正在接入中",
        },
        //申请时间
        keyword7: {
            value: moment().format("lll"),
        },
    };

    formid.used = 1;
    await sendMinaTempMsg(touser.openid, template_id, formid.formid, data, page);
    await formid.save();
    return true;
};


exports.refundConfirm = async (order) => {
    let buyer_id = order.buyer._id || order.buyer;
    let touser = await User.findById(buyer_id);
    let formid = await getFormid(touser._id);
    if (!formid) {
        return false;
    }
    let template_id = "gqC4nVJRmqjL_mFAifx4h7-cg9upXxXEmfr5wNYwd3k";
    let page = "pages/news/news";
    let data = {
        //温馨提示
        keyword1: {
            value: "退款已到账，可到我的钱包提现",
        },
        //订单号
        keyword2: {
            value: order.sn,
        },
        //商品名称
        keyword3: {
            value: order.goodsInfo.gname,
        },
        //退款金额
        keyword4: {
            value: order.price,
        },
        //到账时间
        keyword5: {
            value: moment().format("lll"),
        },
    };

    formid.used = 1;
    await sendMinaTempMsg(touser.openid, template_id, formid.formid, data, page);
    await formid.save();
    return true;
};

exports.commentNotify = async (comment_id) => {

    let comment = await Comment.findOne({ _id: comment_id }).populate("fromId").populate("goodsId");
    let touser = await User.findOne({ _id: comment.toId || comment.goodsId.userID });
    let tid = String(touser._id);
    let fid = String(comment.fromId._id);
    logger.info(comment.fromId._id);
    logger.info(touser);
    if (fid === tid) {
        logger.info("not sending notify");
        return false;
    }

    let formid = await getFormid(touser._id);
    if (!formid) {
        return false;
    }
    let template_id = "JLDhk92YgwbcLrvXmGEvK7_mjXfSv0x8RtyZDnb0_s4";
    let page = "pages/message/message";
    let data = {
        //评论人
        keyword1: {
            value: comment.fromId.nickName,
        },
        //评论主题
        keyword2: {
            value: comment.goodsId.gname,
        },
        //评论内容
        keyword3: {
            value: comment.content,
        },
        //留言时间
        keyword4: {
            value: moment(comment.created_date).format("lll"),
        },
        //温馨提醒
        keyword5: {
            value: "点击即可回复",
        },
    };
    formid.used = 1;
    await sendMinaTempMsg(touser.openid, template_id, formid.formid, data, page);
    await formid.save();
    return true;
};


exports.oldGoodsNotify = async (goods) => {

    let touser = await User.findOne({ _id: goods.userID });

    let formid = await getFormid(touser._id);
    if (!formid) {
        return false;
    }
    let template_id = "ifQlwUFT54VLxRO0o187Qx4jxAHMeISowUTb6-h193o";
    let page = "pages/detail/detail?scene=" + goods._id;
    let data = {
        //温馨提醒
        keyword1: {
            value: "商品无人问津，快回来降降价吧",
        },
        //商品名称
        keyword2: {
            value: goods.gname,
        },
        //时间
        keyword3: {
            value: moment(goods.created_date).format("lll"),
        },
        //当前状态
        keyword4: {
            value: "在售中",
        },
    };
    formid.used = 1;
    await sendMinaTempMsg(touser.openid, template_id, formid.formid, data, page);
    await formid.save();
    return true;
};


exports.tagLike = async (userTag, user) => {

    let touser = await User.findOne({ _id: userTag.userID });
    let formid = await getFormid(touser._id);
    if (!formid) {
        return false;
    }
    let template_id = "SG0B82OZyrYOOeHWvqc82ewzsJGNfKKdVklLCFQcOYY";
    let page = "pages/mainuser/mainuser?scene=" + touser._id;
    let data = {
        //点赞通知
        keyword1: {
            value: "又有人认同了你的个性标签！",
        },
        //作品名称
        keyword2: {
            value: userTag.tag_name + "(" + userTag.like_num + "赞)",
        },
        //点赞人
        keyword3: {
            value: user.nickName,
        },
        //点赞时间
        keyword4: {
            value: moment().format("lll"),
        },
    };
    formid.used = 1;
    await sendMinaTempMsg(touser.openid, template_id, formid.formid, data, page);
    await formid.save();
    return true;
};


exports.comeBack = async (touser) => {

    let formid = await getFormid(touser._id);
    if (!formid) {
        return false;
    }
    let template_id = "Hs22s60y7vyh-A7dxDeqtxVTLOfv6WyrWxz7QDTYfP8";
    let delta = moment(touser.updated_date).toNow(true);
    let page = "pages/index/index";
    let data = {
        //服务项目
        keyword1: {
            value: "二货兔校园二手",
        },
        //状态
        keyword2: {
            value: "距离上次登录已经过了" + delta + "啦，快来看看二货兔新发布了什么宝贝吧",
        },
        //温馨提示
        keyword3: {
            value: "好物不等人，刷刷贴别错过属于你的好物，结识你的好友~",
        },
    };
    formid.used = 1;
    await sendMinaTempMsg(touser.openid, template_id, formid.formid, data, page);
    await formid.save();
    return true;
};


exports.sendAuthResult = async (touserId, succeed, content) => {

    let touser = await User.findById(touserId);

    console.log(content + "发送认证结果******************************" + touser._id);
    let formid = await getFormid(touser._id);
    if (!formid) {
        return false;
    }
    let template_id = "VhsrvVsYCnKUOMsPQGXGb0t9ggdK_Q-qHi2VtRjJ3ws";
    let page = "pages/index/index";
    let data = {
        //申请类型
        keyword1: {
            value: "学生认证",
        },
        //认证结果
        keyword2: {
            value: parseInt(succeed) === 1 ? "认证成功" : "认证失败",
        },
        //认证时间
        keyword3: {
            value: moment().format("lll"),
        },
        //备注
        keyword4: {
            value: parseInt(succeed) === 1 ? "恭喜通过学生认证，快去二货兔校园买买买吧" : (content || "请检查上传照片是否清晰，确保照片上包含主要信息，以提高审核通过率"),
        },
    };
    formid.used = 1;
    await sendMinaTempMsg(touser.openid, template_id, formid.formid, data, page);
    await formid.save();
    return true;
};

