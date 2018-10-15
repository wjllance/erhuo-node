let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let _ = require('lodash');

let moment = require('moment');
moment.locale('zh-cn');
let config = require('../config');
let myUtils = require('../tool/mUtils');

// 砍价
let bargainSchema = new Schema({

    goodsId: {
        type : Schema.ObjectId,
        ref : 'Goods',
        required: true
    },

    userID: {
        type : Schema.ObjectId,
        ref : 'User',
        required: true
    },

    owner_id: {
        type : Schema.ObjectId,
        ref : 'User',
        required: true
    },

    amount: Number,

    total_price: Number,

    succeeded_at: Date,

    created_date: {type: Date, default: Date.now},

});


bargainSchema.methods.baseInfo = function() {
    let bar = _.pick(this, ['amount', 'total_price', 'created_date']);
    if(this.owner_id._id){
        bar.owner = this.owner_id.cardInfo();
    }
    if(this.userID._id){
        bar.user = this.userID.cardInfo();
    }
    if(this.goodsId._id){
        bar.goods = this.goodsId.cardInfo();
    }
    bar.created_date = myUtils.dateStr(bar.created_date);
    return bar;
};


module.exports = mongoose.model("bargain", bargainSchema);