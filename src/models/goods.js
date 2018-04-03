
let mongoose = require('mongoose');
let _ = require('lodash');

// 商品
let goodsSchema = new mongoose.Schema({

	userID: {
		type : mongoose.Schema.ObjectId,
		ref : 'User',
		required: true
	},

	gname: String,
	glabel: String,
	gprice: Number,
	gpics: [{
		type : mongoose.Schema.ObjectId,
		ref : 'Image'
	}],
	gstype: String,
	glocation: String,
	gcost: Number,
	gcity: String,

	created_date: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Goods", goodsSchema);
