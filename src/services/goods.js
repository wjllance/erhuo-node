
let _ = require('lodash');

let { User } = require('../models');

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

let postComment = exports.postComment = async function(goods, user, cmt, toUserId){
    let new_comment = {
        content: cmt,
        fromId: user._id,
    };
    if(arguments[3])
    {
        new_comment.toId = toUserId;
    }
    goods.comments.append(new_comment);
    goods.save();
    return goods;
};