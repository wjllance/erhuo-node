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
/*

let outputify = exports.outputify = async function(goods, user) {

    if (!_.isArray(goods)) {
        return _.assign(goods.cardInfo(), await injectGoods(goods, user));
    } else {
        let ugoods = goods.map(x => x.cardInfo());
            // FIXME too slow
        for(let i = 0; i < goods.length; i ++) {
            _.assign(ugoods[i], await injectGoods(goods[i], user));
        }
        return ugoods;
    }
};

*/
exports.followList = async function(user_id, pageSize, pageNo){
	let condition={'toID':user_id};
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
        moments : comments.map(y=>getListInfo(y)),
        total: total,
        hasMore: hasMore
    };

};