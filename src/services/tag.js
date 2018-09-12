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
    }, "_id tag_name like_num")
        .sort({like_num:-1});
    return tags;
};

exports.listWithLike = async (ownerId, user) => {
    let userTags = await UserTag.find({
        userID: ownerId,
        deleted_date:null
    }, "_id tag_name like_num")
        .sort({like_num:-1});

    let ret = [];
    for(let i = 0; i < userTags.length; i++){
        let liked = !!(
            await TagLike.findOne({
                user_tag_id: userTags[i]._id,
                deleted_date: null,
                userID: user ? user._id : null
            }));

        ret.push({
            tag: userTags[i],
            liked: liked
        });
    }
    return ret;
};

exports.detailList = async (ownerId, user) =>{
    // console.log("user",user);
    let userTags = await UserTag.find({
        userID: ownerId,
        deleted_date:null
    }, "_id tag_name like_num")
        .sort({like_num:-1});

    let ret = []
    for(let i = 0; i < userTags.length; i++){
        let likeUsers = await TagLike.find({
            user_tag_id: userTags[i]._id,
            deleted_date: null
        }).populate('userID');

        likeUsers = _.map(likeUsers, u => u.userID.cardInfo());
        let liked = !!(
            await TagLike.findOne({
            user_tag_id: userTags[i]._id,
            deleted_date: null,
            userID: user ? user._id : null
        }));

        ret.push({
            tag: userTags[i],
            like_users: likeUsers,
            liked: liked
        });
        // console.log(ret);
    }
    return ret;
};

let userAddTag = exports.userPostTag = async(user, tag_name) => {
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
};

exports.defaultTag = async(user)=>{
    let userTags = await UserTag.find({
        userID: user._id
    });
    console.log("userTag,,,",userTags);
    if(userTags.length === 0){
        let res = await userAddTag(user, "佛系");
        console.log(res);
        res = await userAddTag(user, "回复神速");
        console.log(res);
    }
};