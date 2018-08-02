
let mongoose = require('mongoose');
let _ = require('lodash');
let tools = require('../services/tools')

let log4js = require('log4js');
let logger = log4js.getLogger('errorLogger');

// 用户标签
let tagLikeSchema = new mongoose.Schema({

    userID: {
        type:  mongoose.Schema.ObjectId,
        ref: 'User',
        require: true
    },
    user_tag_id: {
        type:  mongoose.Schema.ObjectId,
        ref: 'UserTag',
        require:true
    },
    created_date: { type: Date, default: Date.now },
    updated_date: {type: Date, default: Date.now},
    deleted_date: Date,
});


module.exports = mongoose.model("TagLike", tagLikeSchema);
