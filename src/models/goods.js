
let mongoose = require('mongoose');
let _ = require('lodash');
let tools = require('../services/tools')
// 商品
let goodsSchema = new mongoose.Schema({

	userID: {
		type : mongoose.Schema.ObjectId,
		ref : 'User',
		required: true
	},

	gname: String,
	gsummary: String,
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
    removed_date: { type: Date, default: null},
    updated_date: { type: Date, default: Date.now},
});


goodsSchema.methods.toOBJ = function() {
	let g = _.pick(this, ['_id', 'gname', 'gsummary', 'glabel', 'gprice', 'gstype', 'glocation', 'gcost', 'gcity']);
    g.gpics = [];
    g.gpics[0] = this.gpics[0].thumb();
    g.state = this.removed_date ? "已下架" : "在售";
    g.created_date = tools.dateStr(this.created_date);
	return g;
};

module.exports = mongoose.model("Goods", goodsSchema);
