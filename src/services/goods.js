let _ = require("lodash");

let { User, Comment, Goods, Like ,Order} = require("../models");

let auth = require("../services/auth");
let myUtil = require("../tool/mUtils");
const school_map = require("../config").CONSTANT.SCHOOL_MAP;

// const goodsCates = exports.CATES = ["美妆", "女装", "女鞋", "配饰", "包包", "日用", "其他", "求购", "书籍"];
// 对商品注入额外信息
let hasCollected = async function (goods, user) {
    if (!user) return {};

    let res = await Like.findOne({
        goods_id: goods._id,
        userID: user._id,
        deleted_date: null,
    });

    let has_collected = !!res;
    if (!has_collected) {
        has_collected = _.some(user.collections, x => goods._id.equals(x));
    }
    return {
        has_collected,
    };
};

// 获取可以输出的数据
let outputify = exports.outputify = async function (goods, user) {

    if (!_.isArray(goods)) {
        return _.assign(goods.cardInfo(), await hasCollected(goods, user));
    } else {
        let ugoods = goods.map(x => x.cardInfo());
        // FIXME too slow
        for (let i = 0; i < goods.length; i++) {
            _.assign(ugoods[i], await hasCollected(goods[i], user));
        }
        return ugoods;
    }
};


exports.postComment = async function (goods, user, cmt, toUserId) {
    let new_comment = await Comment.create({
        content: cmt,
        fromId: user._id,
    });
    if (toUserId) {
        new_comment.toId = toUserId;
    }
    await new_comment.save();
    goods.comments.push(new_comment._id);
    return await goods.save();
};


let updateStatus = async (goods) => {
    let likenum = await Like.find({
        goods_id: goods._id,
        deleted_date: null,
    }).count();
    let commentnum = await Comment.find({
        goodsId: goods._id,
        deleted_date: null,
    }).count();

    goods.like_num = likenum;
    goods.comment_num = commentnum;
    return await goods.save();
};

// 获取商品详情
let getDetailByIdV2 = exports.getDetailByIdV2 = async function (goods_id, userInfo) {


    let goods = await Goods
            .findById(goods_id)
            .populate("gpics")
            .populate("userID");
    auth.assert(goods, "商品不存在");

    console.log(goods)
    auth.assert(goods, "商品不存在");
    let g = goods.baseInfoV2(1); //fullpic
    g.buyerId=null;
    if(goods.removed_date){
        let order = await Order.findOne( {goods_id : goods._id});
        if(order){
            g.buyerId = order.buyer;
        }
    }
    goods = await updateStatus(goods);
    let jianrong = {
        name: goods.userID.nickName,
        avatar: goods.userID.avatarUrl,
    };
    _.assign(g.user, jianrong);

    let userid = userInfo ? userInfo._id : null;

    let condi = { goodsId: goods_id };
    console.log(userid);
    console.log(goods.userID);
    if (userid != null && !userInfo.isAdmin && !goods.userID._id.equals(userid)) {
        condi.$or = [
            { fromId: userid },
            { toId: userid },
            { secret: null },
            { secret: false },
        ];
    }
    console.log(condi);
    let comments = await Comment
        .find(condi)
        .populate(["fromId", "toId"]);
    g.comments = comments.map(y => y.getFullInfo());

    if (userInfo) {
        _.assign(g, await hasCollected(g, userInfo));
    }
    g.remark = goods.remark;

    return g;
};



let getBaseInfoById = exports.getBaseInfoById = async function (goods_id) {

    let goods = await Goods.findById(goods_id);
    auth.assert(goods, "商品不存在");

    let g = _.pick(goods, ["_id", "gname", "gsummary", "gprice", "gcost", 'category']);
    g.gpics = goods.npics.map(y => myUtil.thumbnail(y));

    g.glocation = goods.locationName || school_map[goods.glocation];
    return g;
};

//商品未下架过滤层
//返回值为true值表示已下架，为null或者false时为未下架
let isGoodRemoved = exports.isGoodRemoved = function (good) {
    return good.removed_date && good.removed_date < Date.now();
};

exports.collectionList = async function (user, pageNo, pageSize) {

    let total = await Goods.find({ _id: user.collections }).count();//用户总收藏数

    let collections = await Goods.find({ _id: user.collections }).limit(pageSize).skip((pageNo - 1) * pageSize).populate("gpics");
    let ugoods = collections.map(x => x.baseInfoV2());
    let hasMore = total - pageNo * pageSize > 0;
    return {
        collections: ugoods,
        hasMore: hasMore,
        total: total,
    };
};


exports.goodsList = async (user, pageNo, pageSize) => {
    let condi = {
        deleted_date: null,
    };
    if (user && user.location > 0) { //not other
        condi.$or = [{
            glocation: user.location,
        }, {
            glocation: 0,
        }];
    }
    let sorti = {
        gpriority: -1,
        removed_date: 1,
        glocation: -1,
        updated_date: -1,
    };
    let total = await Goods.find(condi).count();//表总记录数

    let goods = await Goods.find(condi)
        .sort(sorti)
        .limit(pageSize)
        .skip((pageNo - 1) * pageSize)
        .populate("gpics");
    // console.log(goods);
    let hasMore = total - pageNo * pageSize > 0;
    return {
        goods: await outputify(goods, user),
        hasMore: hasMore,
        total: total,
    };
};


exports.goodsListV2 = async (user, pageNo, pageSize, condi, sorti) => {

    if (!condi) {
        condi = {};
    }
    if (!sorti) {
        sorti = { created_date: -1 };
    }
    let total = await Goods.find(condi).count();//表总记录数

    let goods = await Goods.find(condi)
        .sort(sorti)
        .limit(pageSize)
        .skip((pageNo - 1) * pageSize)
        .populate("gpics")
        .populate("userID");
    // console.log(goods);
    let hasMore = total - pageNo * pageSize > 0;
    return {
        goods: await outputify(goods, user),
        hasMore: hasMore,
        total: total,
    };
};



exports.admingoodsList = async ( pageNo, pageSize) => {

    let     sorti = { created_date: -1 };

    let total = await Goods.find().count();//表总记录数
    let outGoodsInfo = [];
    let goods = await Goods.find()
        .sort(sorti)
        .limit(pageSize)
        .skip((pageNo - 1) * pageSize)
        .populate("gpics")
        .populate("userID");
    console.log(goods);
    for(var i =0;i<goods.length;i++){

        outGoodsInfo[i] =_.pick(goods[i], ['_id','gname', 'category', 'status','gpriority','userID','gprice','gpics','npics']);
        outGoodsInfo[i].schoolName = outGoodsInfo[i].userID.locationName;
        outGoodsInfo[i].userID=null;
    }
    let hasMore = total - pageNo * pageSize > 0;
    return {
        goods: outGoodsInfo,
        hasMore: hasMore,
        total: total,
    };
};



exports.goodsFeedList = async (user, pageNo, pageSize, condi, sorti) => {

    if (!condi) {
        condi = {};
    }
    if (!sorti) {
        sorti = { created_date: -1 };
    }
    let total = await Goods.find(condi).count();//表总记录数

    let goods = await Goods.find(condi)
        .sort(sorti)
        .limit(pageSize)
        .skip((pageNo - 1) * pageSize)
        .populate("userID");
    // console.log(goods);
    let hasMore = total - pageNo * pageSize > 0;
    let ret = await getFeedsInfo(goods, user);
    return {
        goods: ret,
        hasMore: hasMore,
        total: total,
    };
};

getFeedsInfo  = async (goods, user) => {
    let ret = [];
    for (let i = 0; i < goods.length; i++) {
        let comments = await Comment.find({
                goodsId: goods[i].id,
            })
                .sort({
                    updated_date: -1,
                })
                .limit(3)
                .populate("fromId");
        let res = goods[i].cardInfo();
        res.comments = comments.map(x => x.getSimpleInfo());
        _.assign(res, await hasCollected(goods[i], user));
        ret.push(res);
    }
    return ret;
};
