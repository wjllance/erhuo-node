
require('should');
let _ = require('lodash');
let utils = require('utility');
let superagent = require('superagent');
let config = require('../config');
let auth = require('../services/auth');
let { log } = require('../config');
let { User } = require('../models');
let { Account } = require('../models');


exports.indexInfo = async (uid) => {
    let user = await withAccount(uid);
    let account = user.account;
    user = user.baseInfo();
    user.balance = (account.balance / 100).toFixed(2);
    return user;
}

let withAccount = exports.withAccount = async (uid) => {

    let userAccount = await Account.findOne({userID: uid}).populate('userID');
    auth.assert(userAccount, "用户不存在");
    let user = userAccount.userID;
    _.unset(userAccount, 'userID');
    user.account = userAccount;
    return user;
}