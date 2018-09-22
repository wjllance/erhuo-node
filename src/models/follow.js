
let mongoose = require('mongoose');
let _ = require('lodash');
let myUtils = require("../myUtils/mUtils");

// 商品
let followSchema = new mongoose.Schema({
    fromId: {
        type:  mongoose.Schema.ObjectId,
        ref: 'User',
       // required: true
    },
    toId: {
        type:  mongoose.Schema.ObjectId,
        ref: 'User',
        required: true

    },
    secret: Boolean,
    created_date: { type: Date, default: Date.now },
    updated_date: { type: Date, default: Date.now },
    canceled_date: Date,
});

module.exports = mongoose.model("Follow", followSchema);