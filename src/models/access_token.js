
let mongoose = require('mongoose');
let _ = require('lodash');

// 评论
let accessTokenSchema = new mongoose.Schema({

    token: String,
    expire_date: Date,
    type: Number // 0 for Service Account
});

module.exports = mongoose.model("AccessToken", accessTokenSchema);
