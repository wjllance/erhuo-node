
let mongoose = require('mongoose');
let _ = require('lodash');
let config = require('../config');
let moment = require('moment');
// 版本
let versionSchema = new mongoose.Schema({

    name: {
        type: String,
        required: true
    },

    desc: String,

    created_date: { type: Date, default: Date.now },

});

module.exports = mongoose.model("Version", versionSchema);
