require('should');
let _ = require('lodash');
let utils = require('utility');
let superagent = require('superagent');
let config = require('../config');
let log4js = require('log4js');
let logger = log4js.getLogger('errorLogger');
let tools = require("./tools");
let moment = require('moment');
moment.locale('zh-cn');
/*-----------------------------------------------*/


let {Order, Goods, UserGroup, wxGroup} = require('../models');

// exports.findOrCreate = async (openGId, user) =>{
//
//     let condi = {openGId:openGId};
//     let wxgroup = await wxGroup.findOne(condi);
//     if(!wxgroup){
//         wxgroup = await wxGroup.create(condi);
//         createUserGroup(wxgroup, user);
//     }
//     return wxgroup;
// };


exports.createUserGroup = async (wxgroup, user)=>{

    let condi = {
        group_id:wxgroup._id,
        userID: user._id
    };
    let data = {
        // openGId: wxgroup.openGId,
        deleted_date: null
    };
    let userGroup = await UserGroup.findOne(condi);

    if(!userGroup || userGroup.deleted_date){
        userGroup = await UserGroup.findOneAndUpdate(condi, data, {new: true, upsert:true});
        wxgroup.member_num += 1;
        await wxgroup.save();
        await userGroup.save();
        console.log("creating user group...", userGroup);

    }else{
        console.log("created before...", userGroup);
    }
    return wxgroup;
};

let getMembers = exports.getMembers = async (groupId, count) => {

    let users = await UserGroup.find({
        group_id: groupId,
        deleted_date: null
    }).populate('userID')
        .sort({
            created_date:1
        })
        .limit(count);
    return _.map(users, u => u.userID.cardInfo());
};

exports.getGroupList = async (user) => {
    let groups = await UserGroup
        .find({
            userID:user._id,
            deleted_date: null
        })
        .populate('group_id')
        .sort({created_date:-1});
    console.log("mygroups...", groups);

    let ret = [];
    for (let i = 0; i < groups.length; i++){
        let res = {
            group : groups[i].group_id,
            members: await this.getMembers(groups[i].group_id._id, 5)
        };
        ret.push(res);
    }

    return ret;
};