let mongoose = require('mongoose');
let Schema = mongoose.Schema;
let _ = require('lodash');

let identitySchema=new Schema({

       userID: {
        type:  mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    name:String,
    studentID:String,
    school:String,
    cardpics:{
		type : mongoose.Schema.ObjectId,
		ref : 'Image'
	},
    withcardpics:{
		type : mongoose.Schema.ObjectId,
		ref : 'Image'
	},
    status:{ type: Number, default: 0},
    created_date: { type: Date, default: Date.now },
    updated_date: { type: Date, default: Date.now},


});

module.exports = mongoose.model("Identity", identitySchema);
