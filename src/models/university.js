let mongoose = require('mongoose');
let Schema = mongoose.Schema;
let _ = require('lodash');

let universitySchema = new Schema({

    name: String,
    idcode: Number,//学校标识码
    superior: String,//主管部门
    location: String,
    hierarchy: String, //办学的等级
    remarks: String, //备注
});

module.exports = mongoose.model("University", universitySchema);