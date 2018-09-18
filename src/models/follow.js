
let mongoose = require('mongoose');
let _ = require('lodash');
let myUtils = require("../myUtils/mUtils");
const school_map = require('../config').CONSTANT.SCHOOL_MAP;
#const GOODS_STATUS = require('../config').CONSTANT.GOODS_STATUS;
// 商品
let followSchema = new mongoose.Schema({
    fromId: {
        type:  mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    toId: {
        type:  mongoose.Schema.ObjectId,
        ref: 'User'
    },
    secret: Boolean,
    follow_date: { type: Date, default: Date.now },
    canceled_date: Date
},{versionKey:false});

module.exports = mongoose.model("Follow", followSchema);