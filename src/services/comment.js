
require('should');
let _ = require('lodash');
let utils = require('utility');
let superagent = require('superagent');
let config = require('../config');
let { log } = require('../config');
let { User } = require('../models');
let { Goods, Comment } = require('../models');
let tools = require("./tools")


let getListInfo = exports.getListInfo = function(cmt){
    let ret = {
        _id: cmt._id,
        goodsId: cmt.goodsId._id,
        content: cmt.content,
        fromId: cmt.fromId._id,
        fromName: cmt.fromId.nickName,
        fromAvatar: cmt.fromId.avatarUrl,
        // created_date: cmt.created_date
    };
    ret.created_date = tools.dateStr(cmt.created_date);
    ret.gpic = cmt.goodsId.gpics[0].thumb();
    return ret;
};


exports.momentList = async function(user_id, pageSize, pageNo){

    let my_goods_ids = await Goods.find({userID:user_id},['_id']);
    my_goods_ids = my_goods_ids.map(y=>y._id);
    let comments = await Comment.find({
        $or: [
            {goodsId: {$in:my_goods_ids}},
            {toId: user_id}
        ],
        fromId: {$ne: user_id}
    }).populate({
            path: 'goodsId',
            select: 'userID gpics',
            populate: {
                path: 'gpics',
            }
        }).populate('fromId')
        .sort('-created_date').limit(pageSize).skip((pageNo-1)*pageSize);

    let total = await Comment.find({
        $or: [
            {goodsId: {$in:my_goods_ids}},
            {toId: user_id}
        ],
        fromId: {$ne: user_id}
    }).count();
    comments.map(y=>{
        y.read_date = new Date();
        y.save()
    });

    let hasMore=total-pageNo*pageSize>0;
    return {
        moments : comments.map(y=>getListInfo(y)),
        total: total.length,
        hasMore: hasMore
    };
};


exports.post = async function(cmt, goods_id, fromId, toId) {
    let new_comment = await Comment.create({
        content: cmt,
        fromId: fromId,
        goodsId: goods_id
    });
    if (toId)
    {
        new_comment.toId = toId;
    }
    await new_comment.save();
};

exports.unread = async function(user_id) {
    let my_goods_ids = await Goods.find({userID:user_id},['_id']);
    my_goods_ids = my_goods_ids.map(y=>y._id);
    let total = await Comment.find({
        $or: [
            {goodsId: {$in:my_goods_ids}},
            {toId: user_id}
        ],
        fromId: {$ne: user_id},
        read_date: null
    }).count();
    return total;
};


