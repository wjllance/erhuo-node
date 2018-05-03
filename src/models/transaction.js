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
    created_date: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Transaction", transactionSchema);