
let mongoose = require('mongoose');
let _ = require('lodash');

// 评论
let commentsSchema = new mongoose.Schema({

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
});

commentsSchema.methods.toOBJ = function() {
    let g = _.pick(this, ['_id', 'gname', 'gsummary', 'glabel', 'gprice', 'gstype', 'glocation', 'gcost', 'gcity']);
    g.gpics = this.gpics.map(y => y.url());
    return g;
}

module.exports = mongoose.model("Comments", commentsSchema);
