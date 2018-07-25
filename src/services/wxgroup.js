require('should');
let _ = require('lodash');
let utils = require('utility');
let superagent = require('superagent');
let config = require('../config');
let log4js = require('log4js');
let logger = log4js.getLogger('errorLogger');
let tools = require("./tools");
let mUtils = require("../myUtils/mUtils");


let moment = require('moment');
moment.locale('zh-cn');
/*-----------------------------------------------*/


let {Order, Goods, UserGroup, GroupCheckIn, wxGroup} = require('../models');

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


exports.createUserGroup = async (wxgroup, user, inviter)=>{

    let condi = {
        group_id:wxgroup._id,
        userID: user._id
    };
    let data = {
        // openGId: wxgroup.openGId,
        deleted_date: null,
        updated_date: moment()
    };
    if (inviter){
        data.invited_by = inviter.userID;
    }
    let userGroup = await UserGroup.findOne(condi);

    if(!userGroup || userGroup.deleted_date){
        userGroup = await UserGroup.findOneAndUpdate(condi, data, {new: true, upsert:true});

        wxgroup.updated_date = moment();
        if(inviter){
            inviter.invite_times ++;
            await inviter.save();
            console.log("inviter info...", inviter);
        }
        if(wxgroup.member_num === 0){
            userGroup.is_admin = moment();
        }
        await userGroup.save();

        console.log("creating user group...", userGroup);
        wxgroup.member_num = await UserGroup.find({
            group_id: wxgroup._id,
            deleted_date: null
        }).count();
        await wxgroup.save();

    }else{
        console.log("created before...", userGroup);
    }
    return wxgroup;
};

let getMembers = exports.getMembers = async (groupId, count, org) => {
    let condi = {
        group_id: groupId,
        deleted_date: null,
    };
    if (org){ //原始成员
        condi.invited_by = null;
    }
    let users = await UserGroup.find(condi)
        .populate('userID')
        .populate('invited_by')
        .sort({
            is_admin: -1,
            created_date:1
        })
        .limit(count);
    return _.map(users, u => {
        let assign = {
            is_admin: !!u.is_admin,
            invite_times: u.invite_times,
            check_in_times: u.check_in_times
        };
        if (u.invited_by){
            assign.invited_by = u.invited_by.cardInfo();
        }
        return _.assign(u.userID.cardInfo(), assign)
    });
};


let getCheckInMembers = exports.getCheckInMembers = async (groupId, count) => {

    let users = await GroupCheckIn.find({
        group_id: groupId,

        created_date: {
            $gt: moment({h:0})
        }
    }).populate('userID')
        .sort({
            created_date:1
        })
        .limit(count);
    return _.map(users, u => {
        let res = u.userID.cardInfo();
        res.check_in_time = moment(u.created_date).format('LTS');
        return res;
    });
};

exports.getGroupList = async (user) => {
    let groups = await UserGroup
        .find({
            userID:user._id,
            deleted_date: null
        })
        .populate('group_id')
        .sort({updated_date:-1});
    console.log("mygroups...", groups);

    let ret = [];
    for (let i = 0; i < groups.length; i++){
        let ginfo = groups[i].group_id;
        if(groups[i].invited_by && !ginfo.name){
            ginfo.name = "二货兔-人家的群集市";
            ginfo.invited_by = groups[i].invited_by;
        }
        let res = {
            group : ginfo,
            members: await this.getMembers(groups[i].group_id._id, 5)
        };
        ret.push(res);
    }

    return ret;
};