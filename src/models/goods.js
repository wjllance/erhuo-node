
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

	comments: [{
		type : mongoose.Schema.ObjectId,
		ref : 'Comment'
	}],

	created_date: { type: Date, default: Date.now },
});


goodsSchema.methods.getDetail = function() {

};

goodsSchema.methods.toOBJ = function() {
	let g = _.pick(this, ['_id', 'gname', 'gsummary', 'glabel', 'gprice', 'gstype', 'glocation', 'gcost', 'gcity']);
    g.gpics = this.gpics.map(y => y.url());
	g.comments = this.comments.map(y => {
		ret = {
			content: y.content,
			fromId: y.fromId._id,
            fromName: y.fromId.nickName,
            fromAvatar: y.fromId.avatarUrl
		}
		if(y.toId != null)
		{
			ret.toId = y.toId._id;
            ret.toName = y.toId.nickName;
		}
		return ret;
	});

	return g;
};

module.exports = mongoose.model("Goods", goodsSchema);
