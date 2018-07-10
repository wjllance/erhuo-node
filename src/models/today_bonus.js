
let mongoose = require('mongoose');
let _ = require('lodash');
let config = require('../config');
let moment = require('moment');
// 用户
let todayBonusSchema = new mongoose.Schema({

    content: String,
    created_date: { type: Date, default: Date.now },

});

module.exports = mongoose.model("TodayBonusSchema", todayBonusSchema);
