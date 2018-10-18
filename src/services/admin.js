let Adminuser = require('../models/admin_user');
let config = require('../config');
let superagent = require('superagent');
exports.registAdmin = async function (realname,managelLocation,adminId) {

    let level = 2;
    if(adminId==""){
         level=1;
    }
    let adminUser = await Adminuser.create({
        realname:realname,
        manage_location:managelLocation,
        admin_id: adminId,
        level: level
    });
    return adminUser;
};
//管理员登陆
exports.login = async (ctx, code) => {
    let { text } = await superagent.get('https://api.weixin.qq.com/sns/jscode2session').query({
        appid: config.ADMIN_APP_ID,
        secret: config.ADMIN_APP_SECRET,
        js_code: code,
        grant_type: 'authorization_code'
    });
    let data = JSON.parse(text);
    console.log(data);
    console.log("================")
    let user = null;
    if(data.unionid){
        user = await Adminuser.findOneAndUpdate({unionid: data.unionid}, data, {new: true, upsert: true});
    }else{
        user = await Adminuser.findOneAndUpdate({openid: data.openid}, data, {new: true, upsert: true});
    }
    ctx.session.adminUserId = user._id;
    return user;
}