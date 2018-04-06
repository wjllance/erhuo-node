
require('should');
let _ = require('lodash');
let utils = require('utility');
let superagent = require('superagent');
let config = require('../config');
let { log } = require('../config');
let { User } = require('../models');
let { Goods, Comment } = require('../models');


exports.getDetailInfo = function(cmt){
    ret = {
        content: cmt.content,
        fromId: cmt.fromId._id,
        fromName: cmt.fromId.nickName,
        fromAvatar: cmt.fromId.avatarUrl,
        created_date: cmt.created_date
    };
    if(cmt.toId != null)
    {
        ret.toId = cmt.toId._id;
        ret.toName = cmt.toId.nickName;
    }
    return ret;
};

let getListInfo = exports.getListInfo = function(cmt){
    ret = {
        content: cmt.content,
        fromId: cmt.fromId._id,
        fromName: cmt.fromId.nickName,
        fromAvatar: cmt.fromId.avatarUrl,
        created_date: cmt.created_date
    };
    ret.gpic = cmt.goodsId.gpics[0].url();
    return ret;
};


exports.myCommentList = async function(user_id){

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
        }).populate('fromId');
    return { commentList : comments.map(y=>getListInfo(y))};
};


exports.post = async function(cmt, goods_id, fromId, toId) {
    let new_comment = await Comment.create({
        content: cmt,
        fromId: fromId,
        goodsId: goods_id
    });
    if(arguments[3] != null)
    {
        new_comment.toId = toId;
    }
    await new_comment.save();
};



