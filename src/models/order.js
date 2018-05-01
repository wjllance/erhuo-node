let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let _ = require('lodash');
// let tools = require('../services/tools')
// let school_map = require('../config').CONSTANT.SCHOOL_MAP

// 商品
let orderSchema = new Schema({

    goodsId: {
        type : Schema.ObjectId,
        ref : 'Goods',
        required: true
    },
    buyer: {
        type : Schema.ObjectId,
        ref : 'User',
        required: true
    },
    seller: {
        type : Schema.ObjectId,
        ref : 'User',
    },
    // goods_pic: String,

    goodsInfo: Schema.Types.Mixed,
    sn: String,
    price: Number,
    priceGet: Number,
    order_status: {
        type: Number,
        default: 0
    },
    pay_status: {
        type: Number,
        default: 0,
    },
    refund_status:{
        type: Number,
        default: 0,
    },
    paid_at: Date,
    refunded_at: Date,
    created_date: { type: Date, default: Date.now},
    updated_date: { type: Date, default: Date.now},


    // gcost: Number,
});

module.exports = mongoose.model("Order", orderSchema);