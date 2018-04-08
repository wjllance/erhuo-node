
let _ = require('lodash');

let { User  } = require('../models');
let { Comment } = require('../models');
let { Goods } = require('../models');


let tools = require('./tools')

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
        return _.assign(goods.toOBJ(), await injectGoods(goods, user));
    } else {
        let ugoods = goods.map(x => x.toOBJ());
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
    if(arguments[3] != null)
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
        .populate('gpics');
    if(!goods)
        return goods;
    let g = _.pick(goods, ['_id', 'gname', 'gsummary', 'glabel', 'gprice', 'gstype', 'glocation', 'gcost', 'gcity', 'removed_date']);
    g.gpics = goods.gpics.map(y => y.url());
    g.state = this.removed_date ? "已下架" : "在售";
    g.created_date = tools.dateStr(this.created_date);

    let comments = await Comment
            .find({goodsId:goods_id})
            .populate(['fromId','toId']);
    g.comments = comments.map(y => y.getFullInfo());

    if(arguments[1])
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
    let ugoods = collections.map(x => x.toOBJ());
    let hasMore=total-pageNo*pageSize>0;
    return {
        collections: ugoods,
        hasMore : hasMore,
        total : total
    }
}
