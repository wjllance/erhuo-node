
let mongoose = require('mongoose');
let _ = require('lodash');
let tools = require('../services/tools')
let school_map = require('../config').CONSTANT.SCHOOL_MAP
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
	glocation: {
		type: Number,
		default: 0
    },
	gcost: Number,
	gcity: String,
	gpriority: Number,
	created_date: { type: Date, default: Date.now },
    removed_date: { type: Date, default: null},   // 下架
    deleted_date: { type: Date, default: null},   // 删除
    updated_date: { type: Date, default: Date.now},
},{versionKey:false});


goodsSchema.methods.baseInfo = function(fullPic) {
	let g = _.pick(this, ['_id', 'gname', 'gsummary', 'glabel', 'gprice', 'gstype', 'gcost', 'updated_date', 'gpriority']);
	if(fullPic){
        g.gpics = this.gpics.map(y => y.url());
	}else{
        g.gpics = [];
        g.gpics[0] = this.gpics[0].thumb();
    }
    g.state = this.removed_date ? "已下架" : "在售";
    g.created_date = tools.dateStr(this.created_date);
    g.glocation = school_map[this.glocation] ;
	return g;
};

module.exports = mongoose.model("Goods", goodsSchema);
