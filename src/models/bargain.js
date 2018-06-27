let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let _ = require('lodash');

let moment = require('moment');
moment.locale('zh-cn');
let config = require('../config');
let tools = require('../services/tools')

// 砍价
let bargainSchema = new Schema({

    spGoodsId: {
        type : Schema.ObjectId,
        ref : 'spGoods',
        required: true
    },

    userID: {
        type : Schema.ObjectId,
        ref : 'User',
        required: true
    },

    is_owner: Boolean,

    amount: Number,

    total_price: Number,

    succeeded_at: Date,

    created_date: {type: Date, default: Date.now},

});


module.exports = mongoose.model("bargain", bargainSchema);