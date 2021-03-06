let mongoose = require('mongoose');
let Schema = mongoose.Schema;
let _ = require('lodash');
// let tools = require('../services/tools')

// 钱包
let accountSchema = new Schema({

    userID: {
        type:  mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    balance: {  //余额
        type: Number,
        default: 0
    },
    bonus: {    //积分，暂时没用
        type: Number,
        default: 0
    },
    created_date: { type: Date, default: Date.now },
    updated_date: { type: Date, default: Date.now},

});

accountSchema.statics.findOneOrCreate = async function(cond, doc){
    const one = await this.findOne(cond);
    if(!doc){
        doc = cond;
    }
    return one || this.create(doc);
};

accountSchema.methods.baseInfo = function(){
    return _.pick(this, ['_id', 'balance', 'bonus']);
};

let Account = module.exports = mongoose.model("Account", accountSchema);