let mongoose = require('mongoose');
let _ = require('lodash');  //为什么要用——
let config = require('../config');

let messageSchema=new mongoose.Schema(
	content:String;
	formID:{
		type:  mongoose.Schema.ObjectID,
		ref:'User',
		required:true
	}
	toID:{
		type:  mongoose.Schema.ObjectID,
		ref:'User',
		required:true
	}
	read_date: {type: Date, default: null},
    created_date: { type: Date, default: Date.now }

	);


module.exports=mongoose.model("Message",messageSchema)