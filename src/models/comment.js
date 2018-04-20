
let mongoose = require('mongoose');
let _ = require('lodash');
let tools = require('../services/tools')

let log4js = require('log4js');
let logger = log4js.getLogger('errorLogger');

// 评论
let commentSchema = new mongoose.Schema({

    content: String,
    fromId: {
        type:  mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    toId: {
        type:  mongoose.Schema.ObjectId,
        ref: 'User'
    },
    goodsId: {
        type:  mongoose.Schema.ObjectId,
        ref: 'Goods'
    },
    read_date: {type: Date, default: null},
    created_date: { type: Date, default: Date.now },
});


commentSchema.methods.getFullInfo = function() {
    if(!this.fromId){
        logger.error("fromid not exist")
        logger.error(this);
        return {}
    }
    let ret = {
        _id: this._id,
        content: this.content,
        fromId: this.fromId._id,
        fromName: this.fromId.nickName,
        fromAvatar: this.fromId.avatarUrl,
        created_date: tools.dateStr(this.created_date)
    };
    if(this.toId != null)
    {
        ret.toId = this.toId._id;
        ret.toName = this.toId.nickName;
    }
    return ret;
};


module.exports = mongoose.model("Comment", commentSchema);
