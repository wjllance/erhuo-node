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


let {Order, Goods, Bargain} = require('../models');




exports.findOrCreate = async (goods, user) =>{
    let condi = {
        goodsId: goods._id,
        userID: user._id,
        owner_id: user._id
    };
    let bargain = await Bargain.findOne(condi);
    if(!bargain){
        bargain = new Bargain(condi);
        bargain.total_price = goods.gprice;
        bargain.amount = (bargain.total_price * 0.12 + bargain.total_price * 0.08 * Math.random()).toFixed(2);
        await bargain.save();
    }
    return bargain;
}

exports.joinBargain = async (bargainDet, user, maxAmount)=>{

    let condi = {
        goodsId: bargainDet.goods._id,
        owner_id: bargainDet.owner._id,
        userID: user._id
    };
    let joinBargain = await Bargain.findOne(condi);
    if(!joinBargain){
        if(maxAmount < 0.01){
            return null;
        }
        joinBargain = new Bargain(condi);
        joinBargain.total_price = bargainDet.total_price;
        let rand = bargainDet.total_price * 0.07 + bargainDet.total_price * 0.06 * Math.random();
        if (rand < maxAmount){
            joinBargain.amount = rand.toFixed(2);
        }else{
            joinBargain.amount = maxAmount;
        }
        // joinBargain.amount = rand < maxAmount? rand : maxAmount;
        await joinBargain.save();
        joinBargain.is_new = true;
    }else{
        joinBargain.is_new = false;
    }
    return joinBargain;
}

exports.getDetailById = async (bargainId)=>{
    let bargain = await Bargain
        .findById(bargainId)
        .populate('owner_id')
        .populate('userID');

    auth.assert(bargain, "没有");

    let bargains = await Bargain.find({
        goodsId: bargain.goodsId,
        owner_id: bargain.owner_id
    })
        .populate('userID')
        .sort({created_date:-1});

    let friends = _.map(bargains, bar => bar.baseInfo());

    let now = 0;
    for (let i = 0; i < bargains.length; i++){
        now += bargains[i].amount;
        bargains[i].created_date = myUtils.dateStr(bargains[i].created_date);
    }
    let rest = bargain.total_price - now;


    let goods = await Goods.findById(bargain.goodsId).populate('userID');
    let ret = {};
    // ret.my_bargain = bargain.baseInfo();

    ret.goods = goods.baseInfoV2();
    ret.user = bargain.userID.cardInfo();
    ret.owner = bargain.owner_id.cardInfo();

    ret.amount = bargain.amount;
    ret.total_price = bargain.total_price;

    ret.now = now.toFixed(2);
    ret.rest = rest.toFixed(2);
    ret.friends = friends;
    return ret;
};

exports.getPrice = async (goodsId, userId)=>{
    let bargains = await Bargain.find({
        goodsId: goodsId,
        owner_id: userId
    });
    let now = 0;
    for (let i = 0; i < bargains.length; i++){
        now += bargains[i].amount;
    }
    return bargains[0].total_price - now;
}