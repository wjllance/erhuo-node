
let mongoose = require('mongoose');
let _ = require('lodash');
let myUtils = require("../myUtils/mUtils");

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
    secret: Boolean,
    read_date: {type: Date, default: null},
    created_date: { type: Date, default: Date.now },
    deleted_date: Date
},{versionKey:false});


commentSchema.methods.getFullInfo = function() {
    if(!this.fromId){
        logger.error("fromid not exist")
        logger.error(this);
        return {}
    }
    let title = "";
    if(this.secret){
        title += "(密)";
    }
    title += this.fromId.nickName;
    let ret = {
        _id: this._id,
        content: this.content,
        fromId: this.fromId._id,
        fromName: this.fromId.nickName,
        fromAvatar: this.fromId.avatarUrl,
        created_date: myUtils.dateStr(this.created_date)
    };
    if(this.toId != null)
    {
        ret.toId = this.toId._id;
        ret.toName = this.toId.nickName;
        title += " @"+this.toId.nickName;
    }
    ret.title = title;
    return ret;
};


module.exports = mongoose.model("Comment", commentSchema);
