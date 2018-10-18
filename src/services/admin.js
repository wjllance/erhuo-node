let Adminuser = require('../models/admin_user');
let config = require('../config');
let superagent = require('superagent');
exports.registAdmin = async function (realname, managelLocation, adminId) {

    let level = 2;
    if (adminId == "") {
        level = 1;
    }
    let adminUser = await Adminuser.create({
        realname: realname,
        manage_location: managelLocation,
        admin_id: adminId,
        level: level
    });
    return adminUser;
};
//管理员登陆
exports.login = async (ctx, code, account) => {
    let {text} = await superagent.get('https://api.weixin.qq.com/sns/jscode2session').query({
        appid: config.ADMIN_APP_ID,
        secret: config.ADMIN_APP_SECRET,
        js_code: code,
        grant_type: 'authorization_code'
    });
    let data = JSON.parse(text);
    console.log(data);
    console.log(account + "================")
    let msg = "0";
    let admin = await Adminuser.findOne({admin_id: account});
    // auth.assert(admin, "请输入正确的管理员账号");
    if (!admin.openid) {
        admin = await Adminuser.findOneAndUpdate({openid: data.openid}, data, {new: true, upsert: true});
    } else if (admin.openid == data.openid) {
        msg = "1";
    }
    ctx.session.adminUserId = admin._id;
    return msg;

}