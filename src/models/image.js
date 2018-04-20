
let mongoose = require('mongoose');
let _ = require('lodash');

let config = require('../config');

// 上传的图片
let imageSchema = new mongoose.Schema({

	userID: {
		type : mongoose.Schema.ObjectId,
		ref : 'User',
		required: true
	},

    filename: String,
    thumbnails: String,

	created_date: { type: Date, default: Date.now },
});

imageSchema.methods.url = function() {
	return config.SERVER.URL_PREFIX + '/' + this.filename;
}

imageSchema.methods.urlwithid = function() {
    let ret =  {
    	url: config.SERVER.URL_PREFIX + '/' + this.filename,
		_id: this._id
    };
	console.log(ret);
	return ret;
}

imageSchema.methods.thumb = function() {
	let fn = this.thumbnails || this.filename;
    return config.SERVER.URL_PREFIX + '/' + fn;
}

module.exports = mongoose.model("Image", imageSchema);
