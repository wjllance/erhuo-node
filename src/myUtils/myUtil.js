
/*
var Sig = require('../libs/tlssdk/lib/TimGenerateSig.js');
let im_config = require('../libs/tlssdk/config/config');



exports.getIMSig = async (identifier)=>{
    let new_config = im_config;
    new_config.identifier = identifier;
    let sig = new Sig(new_config);
    let res = {};
    await sig.genSigAsync(function (userSig, expires) {
        res.userSig = userSig;
        res.expires = expires;
    });
    return res;
};
*/

