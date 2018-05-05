
let config = require('../../../config');

module.exports = {
    sdkAppid: ""+config.IMSDK_APPID,
    identifier: 'erhuotu',
    accountType:  '26231',
    version: '201512300000',
    privateKey : '../../imkeys/private_key',
    expireAfter: 30 * 24 * 3600,
};

