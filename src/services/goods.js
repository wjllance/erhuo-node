
let _ = require('lodash');

let { User  } = require('../models');
let { Comment } = require('../models');
let { Goods } = require('../models');

// 对商品注入额外信息
let injectGoods = exports.injectGoods = async function(goods, user) {
    if (!user) return {};
    let has_collected = _.some(user.collections, x => goods._id.equals(x));
    return {
        has_collected
    };
}

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
}

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
let getDetailById = exports.getDetailById = async function(goods_id) {

    return Goods
        .findById(goods_id)
        .populate({
            path: 'comments',
            populate: {
                path: 'fromId toId',
            }
        })
        .populate('gpics');
}

// 获取商品详情
let getBaseById = exports.getBaseById = async function(goods_id) {

    return Goods.findById(goods_id);
}