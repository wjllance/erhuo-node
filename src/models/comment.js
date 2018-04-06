
let mongoose = require('mongoose');
let _ = require('lodash');

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
    created_date: { type: Date, default: Date.now },
});


module.exports = mongoose.model("Comment", commentSchema);
