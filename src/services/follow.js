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
let  {Follow, User} = require('../models');


/*
exports.followList = async (user, pageNo, pageSize, condi, sorti)=>{

    if(!condi){
        condi = {}
    }
    if(!sorti){
        sorti = {created_date:-1}
    }
    let total = await Goods.find(condi).count();//表总记录数

    let goods = await Goods.find(condi)
        .sort(sorti)
        .limit(pageSize)
        .skip((pageNo-1)*pageSize)
        .populate('gpics')
        .populate('userID');
    // console.log(goods);
    let hasMore=total-pageNo*pageSize>0;
    return {
        goods: await outputify(goods, user),
        hasMore: hasMore,
        total: total
    }
}

*/
let outputify = exports.outputify = async function(followinfo,user_id) {
         for(let i = 0; i < followinfo.length; i ++) {
            _.assign(followinfo[i], await injectFollows(followinfo[i],user));

};

let injectFollows = exports.injectFollows = async function(followinfo,user_id) {
    if (!follow) return {};

    let res = await Follow.findOne({
        fromId:user_id,
        toId:fromId,
        canceled_date: null
    });

    let has_followed = !(!res);

    // let has_collected = false;
    if(!has_followed){
       // has_collected = _.some(user.collections, x => goods._id.equals(x));
       //这一块还没写
    }
    return {
        has_followed
    };

};


exports.followList = async function(user_id, direction,pageSize, pageNo){
	if(direction==1){
    let condition={'toID':user_id};
    }
    else 
    {
        let condition={'fromID':user_id};
    }

	let skipnum = (pageNo - 1) * pageSize;  
	let sort={'created_date':-1};
	let followers= Follow.find(condition).skip(skipnum).limit(pageSize).sort(sort);
	let followinfo=Follow.populate({
            path: 'fromId',
            select: 'avatarurl nickname',
            });
	let total=followers.count();
	let hasMore=total-pageNo*pageSize>0;
	return {
        items:followinfo,
        total: total,
        hasMore: hasMore

    };

};