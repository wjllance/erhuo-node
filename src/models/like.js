
let mongoose = require('mongoose');
let _ = require('lodash');
let tools = require('../services/tools')

let log4js = require('log4js');
let logger = log4js.getLogger('errorLogger');

// 点赞
let likeSchema = new mongoose.Schema({

    userID: {
        type:  mongoose.Schema.ObjectId,
        ref: 'User',
        require: true
    },
    goods_id: {
        type:  mongoose.Schema.ObjectId,
        ref: 'Goods',
        require:true
    },
    read_date: Date,
    deleted_date: Date,
    updated_date: { type: Date, default: Date.now },
});


module.exports = mongoose.model("Like", likeSchema);
