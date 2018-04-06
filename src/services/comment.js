
require('should');
let _ = require('lodash');
let utils = require('utility');
let superagent = require('superagent');
let config = require('../config');
let { log } = require('../config');
let { User } = require('../models');
let { Comment } = require('../models');


exports.getFullInfo = function(cmt){
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

exports.getMyComments = async function(user_id){

    let comments = Comment.find();
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



