let mongoose = require('mongoose');
let Schema = mongoose.Schema;
let _ = require('lodash');

let zhaopinSchema=new Schema({

    userID: {
        type:  mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    IsUnderstand: {
        type: Number,
        default: 0 //否
    },
        //是否要深入了解
    name:String,
    tel:String,
    school:String,
    profession:String,
    grade:String,
    preference:String,
    IsDurable: {
        type: Number,
        default: 0 //否
    },//能否坐班
    created_date: { type: Date, default: Date.now },
    updated_date: { type: Date, default: Date.now},

});


module.exports = mongoose.model("Zhaopin", zhaopinSchema);