
let mongoose = require('mongoose');
let _ = require('lodash');
let tools = require('../services/tools')

let log4js = require('log4js');
let logger = log4js.getLogger('errorLogger');

// 点赞
let tagSchema = new mongoose.Schema({

    name: {
        type: String,
        require: true
    },
    count: {
        type: Number,
        default: 0
    },
    created_date: { type: Date, default: Date.now },
    updated_date: { type: Date, default: Date.now },
});


module.exports = mongoose.model("Tag", tagSchema);
