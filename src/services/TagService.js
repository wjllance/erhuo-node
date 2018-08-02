require('should');
let _ = require('lodash');
let utils = require('utility');
let superagent = require('superagent');
let config = require('../config');
let log4js = require('log4js');
let logger = log4js.getLogger('errorLogger');
let tools = require("./tools");
let myUtils = require("../myUtils/mUtils");
let auth = require('../services/auth');
/*-----------------------------------------------*/
let  {Tag, UserTag, TagLike} = require('../models');


exports.baseList = async (userId) => {
    let tags = await UserTag.find({
        userID: userId,
        deleted_date:null
    }, "_id tag_name like_num");
    return tags;
};

exports.userPostTag = async(user, tag_name) => {
    let tag = await Tag.findOne({
        name: tag_name
    });
    if(!tag){
        tag = new Tag({name:tag_name})
    }
    tag.count ++;
    tag.save();

    let userTag = await UserTag.findOne({
        userID: user._id,
        tag_id: tag._id
    });

    auth.assert(!userTag || userTag.deleted_date, "标签已存在");
    userTag = await UserTag.findOneAndUpdate({
        userID: user._id,
        tag_id: tag._id
    }, {
        deleted_date: null,
        tag_name: tag.name,
        updated_date: new Date()
    }, {new:true, upsert:true});
    return userTag;
}