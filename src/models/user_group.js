
let mongoose = require('mongoose');
let _ = require('lodash');
let config = require('../config');
let moment = require('moment');
// 用户
let userGroupSchema = new mongoose.Schema({

    userID: {
        type:  mongoose.Schema.ObjectId,
        ref: 'User',
        required: true,
    },
    // 微信群id
    group_id: {
        type:  mongoose.Schema.ObjectId,
        ref: 'wxGroup',
        required: true,
        index: true
    },

    // openGId: {
    //     type: String,
    //     require: true,
    //     index: true
    // },
    check_in_times: {
        type: Number,
        default: 0
    },

    invited_by: {
        type:  mongoose.Schema.ObjectId,
        ref: 'User',
    },

    invite_times: {
        type: Number,
        default: 0
    },

    is_admin : Date,

    extra: mongoose.Schema.Types.Mixed,

    created_date: { type: Date, default: Date.now },
    updated_date: { type: Date, default: Date.now },
    deleted_date: Date

});

module.exports = mongoose.model("UserGroup", userGroupSchema);
