
let _ = require('lodash');

let { User  } = require('../models');
let { Comment } = require('../models');
let { Goods } = require('../models');

let tools = require('./tools')
const schools = require('../config').CONSTANT.SCHOOL;

// 对商品注入额外信息
let injectGoods = exports.injectGoods = async function(goods, user) {
    if (!user) return {};
    let has_collected = _.some(user.collections, x => goods._id.equals(x));
    return {
        has_collected
    };
};

// 获取可以输出的数据
let outputify = exports.outputify = async function(goods, user) {
    if (!_.isArray(goods)) {
        return _.assign(goods.baseInfo(), await injectGoods(goods, user));
    } else {
        let ugoods = goods.map(x => x.baseInfo());
            // FIXME too slow
        for(let i = 0; i < goods.length; i ++) {
            _.assign(ugoods[i], await injectGoods(goods[i], user));
        }
        return ugoods;
    }
};

exports.postComment = async function(goods, user, cmt, toUserId){
    let new_comment = await Comment.create({
        content: cmt,
        fromId: user._id
    });
    if (toUserId)
    {
        new_comment.toId = toUserId;
    }
    await new_comment.save();
    goods.comments.push(new_comment._id);
    return await goods.save();
};

// 获取商品详情
let getDetailById = exports.getDetailById = async function(goods_id, userInfo) {

    let goods = await Goods
        .findById(goods_id)
        .populate('gpics')
        .populate('userID');
    if(!goods)
        return goods;
    let g = goods.baseInfo(1);
    // g.gpics = goods.gpics.map(y => y.url());

    // let g = _.pick(goods, ['_id', 'gname', 'gsummary', 'glabel', 'gprice', 'gstype', 'glocation', 'gcost', 'gcity']);
    // g.state = goods.removed_date ? "已下架" : "在售";
    // g.created_date = tools.dateStr(goods.created_date);
    // g.glocation = school_map[goods.glocation] ;

    g.user = {
        _id: goods.userID._id,
        name: goods.userID.nickName,
        avatar: goods.userID.avatarUrl
    };
    let comments = await Comment
            .find({goodsId:goods_id})
            .populate(['fromId','toId']);
    g.comments = comments.map(y => y.getFullInfo());

    if (userInfo)
    {
        _.assign(g, await injectGoods(g, userInfo));
    }
    return g;
};

// 获取商品详情
let getBaseById = exports.getBaseById = async function(goods_id) {
    return Goods.findById(goods_id);
};

let getCardInfoById = exports.getBaseById = async function(goods_id) {
    return Goods.findById(goods_id)
        .populate('gpics');
};

//商品未下架过滤层
//返回值为true值表示已下架，为null或者false时为未下架
let isGoodRemoved = exports.isGoodRemoved = async function(good) {
    return good.removed_date && good.removed_date < Date.now();
};

exports.collectionList = async function(user_state, pageNo, pageSize)
{

    let total = await Goods.find({_id: user_state.collections}).count();//用户总收藏数

    let collections = await Goods.find({_id: user_state.collections}).limit(pageSize).skip((pageNo-1)*pageSize).populate('gpics');
    let ugoods = collections.map(x => x.baseInfo());
    let hasMore=total-pageNo*pageSize>0;
    return {
        collections: ugoods,
        hasMore : hasMore,
        total : total
    }
}


exports.goodsList = async (user, pageNo, pageSize)=>{
    let condi = {
        deleted_date: null,
    };
    if(user && user.location>0){ //not other
        condi.glocation = user.location
    }
    let total = await Goods.find(condi).count();//表总记录数
    let goods = await Goods.find(condi).sort({removed_date:1, created_date:-1}).limit(pageSize).skip((pageNo-1)*pageSize).populate('gpics');
    let hasMore=total-pageNo*pageSize>0;
    return {
        goods: await outputify(goods, user),
        hasMore: hasMore,
        total: total
    }
}
