
let mongoose = require('mongoose');
let _ = require('lodash');
let tools = require('../services/tools')

let log4js = require('log4js');
let logger = log4js.getLogger('errorLogger');

// 用户标签
let userTagSchema = new mongoose.Schema({

    userID: {
        type:  mongoose.Schema.ObjectId,
        ref: 'User',
        require: true
    },
    tag_id: {
        type:  mongoose.Schema.ObjectId,
        ref: 'Tag',
        require:true
    },
    tag_name: String,
    like_num: {
        type: Number,
        default:0
    },
    created_date: { type: Date, default: Date.now },
    updated_date: { type: Date, default: Date.now },
    deleted_date: Date
});


module.exports = mongoose.model("UserTag", userTagSchema);
