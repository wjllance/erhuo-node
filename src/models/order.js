
let mongoose = require('mongoose');
let _ = require('lodash');
// let tools = require('../services/tools')
// let school_map = require('../config').CONSTANT.SCHOOL_MAP

// 商品
let orderSchema = new mongoose.Schema({


    goodsId: {
        type : mongoose.Schema.ObjectId,
        ref : 'Goods',
        required: true
    },
    buyer: {
        type : mongoose.Schema.ObjectId,
        ref : 'User',
        required: true
    },

    price: Number,
    order_status: Number,
    pay_status: Number,
    notified_at: Date,
    goods_pic: String,
    goodsInfo: mongoose.Schema.Mixed,


    created_date: { type: Date, default: Date.now },
    updated_date: { type: Date, default: Date.now},


    // gstype: String,
    // gcost: Number,
});

module.exports = mongoose.model("Order", orderSchema);