
let mongoose = require('mongoose');
let _ = require('lodash');
let config = require('../config');
let moment = require('moment');
// 用户
let wxGroupSchema = new mongoose.Schema({

        // 微信群id
        openGId: {
            type: String,
            require: true,
            index: true
        },

        name: String,

        member_num: {
            type: Number,
            default: 1
        },

        created_date: { type: Date, default: Date.now },
        updated_date: { type: Date, default: Date.now },
        deleted_date: Date,

});

module.exports = mongoose.model("wxGroup", wxGroupSchema);
