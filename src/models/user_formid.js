
let mongoose = require('mongoose');
let _ = require('lodash');
let config = require('../config')
// 用户
let userFormidSchema = new mongoose.Schema({

    user_id: {
        type : mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    formid: {
        type: mongoose.Schema.Types.String,
        unique: true,
        required: true
    },
    used: {
        type: Boolean,
        default: 0
    },
    expire_date: Date
},{versionKey:false});


module.exports = mongoose.model("UserFormid", userFormidSchema);