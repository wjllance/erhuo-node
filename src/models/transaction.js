let mongoose = require('mongoose');
let Schema = mongoose.Schema;
let _ = require('lodash');
// let tools = require('../services/tools')
// let school_map = require('../config').CONSTANT.SCHOOL_MAP

// 钱包
let transactionSchema = new Schema({

    accountId: {
        type : mongoose.Schema.ObjectId,
        ref : 'Account',
        required: true
    },
    type: Number,
    amount: Number,
    info: Schema.Types.Mixed,
    desc: String,
    orderId: {
        type : mongoose.Schema.ObjectId,
        ref : 'Order'
    },
    status: {
        type:Number,
        default: 0
    },
    created_date: { type: Date, default: Date.now },
    countdown_date: Date,
    finished_date: Date
});

module.exports = mongoose.model("Transaction", transactionSchema);