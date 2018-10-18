//
//
// open_id:
// wx_nickName
// wx_avatarUrl
// union_id
//
//
//
// admin_id:
// level:   //1超级，2普通
// manage_location: []
// realname:



let mongoose = require('mongoose');
let Schema = mongoose.Schema;
let _ = require('lodash');


// 管理员
let adminSchema = new Schema({


    openid:String,
    nickName:String,
    avatarUrl:String,
    unionid:String,
    session_key:String,

    admin_id:Number,
    level :{// 1 超级 2 普通
        type:Number,
        default: 2
    },
    manage_location: [],
    realname:String,
    created_date: { type: Date, default: Date.now },


});


let Adminuser = module.exports = mongoose.model("Adminuser", adminSchema);
