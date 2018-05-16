
let mongoose = require('mongoose');
let _ = require('lodash');
let config = require('../config')
// 用户
let userFormidSchema = new mongoose.Schema({

    user_id: {
        type : mongoose.Schema.ObjectId,
        ref: 'User'
    },
    formid: {
        type: String,
        unique: true,
        dropDups: true
    },
    expire_date: Date
},{versionKey:false});


module.exports = mongoose.model("UserFormid", userFormidSchema);