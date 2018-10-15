require('should');
let _ = require('lodash');
let utils = require('utility');
let config = require('../config');
let log4js = require('log4js');
let logger = log4js.getLogger('errorLogger');
let tools = require("./tools");
let myUtils = require("../tool/mUtils");
let auth = require('../services/auth');
/*-----------------------------------------------*/
let { Follow, User } = require('../models');

let outputify = exports.outputify = async function(userList, me) {

    if (!_.isArray(userList)) {
        return _.assign(userList.cardInfo(), await injectFollow(userList, me));
    } else {
        let tuserList = userList.map(x => x.cardInfo());
        // FIXME too slow
        for(let i = 0; i < tuserList.length; i ++) {
            _.assign(tuserList[i], await injectFollow(tuserList[i], me));
        }
        return tuserList;
    }
};


let injectFollow = exports.injectFollow = async function (user, me) {
    if (!user) return {};
    let res = await Follow.findOne({
        fromId: me._id,
        toId: user._id,
        canceled_date: null,
    });
    let fansNum = await Follow.find({
        toId: user._id
    }).count();
    return {
        followed: !(!res),
        fansNum
    };

};


exports.followerList = async function (me, pageNo, pageSize, user) {

    let condi = {
        toId: user._id,
        canceled_date: null
    };
    let sorti = {
        created_date: -1
    };
    let total = await Follow.find(condi).count();//表总记录数

    let res = await Follow
        .find(condi)
        .skip((pageNo-1)*pageSize)
        .limit(pageSize)
        .sort(sorti)
        .populate('fromId');
    let hasMore=total-pageNo*pageSize>0;
    console.log(res);
    return {
        items: await outputify(_.map(res, item => item.fromId), me),
        hasMore: hasMore,
        total: total
    }
};

exports.concernedList = async function (me, pageNo, pageSize, user) {

    let condi = {
        fromId: user._id,
        canceled_date: null
    };
    let sorti = {
        created_date: -1
    };
    let total = await Follow.find(condi).count();//表总记录数

    let res = await Follow
        .find(condi)
        .skip((pageNo-1)*pageSize)
        .limit(pageSize)
        .sort(sorti)
        .populate('toId');
    let hasMore=total-pageNo*pageSize>0;

    console.log(res);
    return {
        items: await outputify(_.map(res, item => item.toId), me),
        hasMore: hasMore,
        total: total
    }
};