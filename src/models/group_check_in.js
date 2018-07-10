
let mongoose = require('mongoose');
let _ = require('lodash');
let config = require('../config');
let moment = require('moment');
// 用户
let groupCheckInSchema = new mongoose.Schema({

    userID: {
        type:  mongoose.Schema.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    // 微信群id
    group_id: {
        type:  mongoose.Schema.ObjectId,
        ref: 'wxGroup',
        required: true,
        index: true
    },

    created_date: { type: Date, default: Date.now },

});

module.exports = mongoose.model("GroupCheckIn", groupCheckInSchema);
