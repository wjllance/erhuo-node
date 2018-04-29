let mongoose = require('mongoose');
let Schema = mongoose.Schema;
let _ = require('lodash');
// let tools = require('../services/tools')
// let school_map = require('../config').CONSTANT.SCHOOL_MAP

// 钱包
let walletSchema = new Schema({

    balance: {
        type: Number,
        default: 0
    },
    bonus: {
        type: Number,
        default: 0
    },
    created_date: { type: Date, default: Date.now },
    updated_date: { type: Date, default: Date.now},

});

module.exports = mongoose.model("Wallet", walletSchema);