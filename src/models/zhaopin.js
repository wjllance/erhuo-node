let mongoose = require('mongoose');
let Schema = mongoose.Schema;
let _ = require('lodash');

let zhaopinSchema=new Schema({


    userID:String,
    employeeId:String,//被招聘人的id
    IsUnderstand:{type: Number},//是否要深入了解
    name:String,
    tel:String,
    school:String,
    profession:String,
    grade:String,
    preference:String,
    IsDurable:{type:Number},//能否坐班
    created_date: { type: Date, default: Date.now },
    updated_date: { type: Date, default: Date.now},

});


module.exports = mongoose.model("Zhaopin", zhaopinSchema);