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
        group_id:groupId,
        userID: ctx.state.user._id
    };
    let data = {
        openGId: wxgroup.openGId,
        deleted_date: null
    }
    let userGroup = await UserGroup.find(condi);

    if(userGroup && !userGroup.deleted_date){
        return userGroup;
    }

    wxgroup.member_num += 1;
    await wxgroup.save();

    userGroup = await UserGroup.findOneAndUpdate(condi, data, {new: true, upsert:true});

    console.log("creating user group...", userGroup);
    return userGroup;
};

exports.getMembers = async (groupId) => {
    let users = await UserGroup.find({
        group_id:groupId,
        deleted_date:null
    }).populate('user');
    return _.map(users, u=>u.userID);
}