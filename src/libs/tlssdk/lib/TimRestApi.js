var Sig = require('./TimGenerateSig.js');
var https = require('https');
var util = require('util');
var maxSock = 10000;
var keepAliveAgent = new https.Agent({
    keepAlive: true,
    maxSockets: maxSock
});

var TimRestAPI = function(config) {
    this.sdkAppid = config.sdkAppid;
    this.identifier = config.identifier;
    this.config = config;
}

TimRestAPI.prototype.init = async function() {
        var self = this;
        // get usersig
        var sig = new Sig(this.config);
        let res = await sig.genSig(function(usersig, expireUntil) {
            self.usersig = usersig;
            self.expireUntil = expireUntil;
        });
        console.log(self);
}

TimRestAPI.prototype.request = async function(serviceName, cmdName, reqBody) {
        var self = this;
        if (this.expireUntil < (Date.now() / 1000)) {
            var sig = new Sig(this.config);
            await sig.genSig(function(usersig, expireUntil) {
                self.usersig = usersig;
                self.expireUntil = expireUntil;
            });
        }

        return new Promise((resolve, reject) => {
            var urlPath = util.format("/v4/%s/%s?usersig=%s&identifier=%s&sdkappid=%s&contenttype=json", serviceName, cmdName, this.usersig, this.identifier, this.sdkAppid);
            var requestArg = {
                agent: keepAliveAgent,
                host: 'console.tim.qq.com',
                method: 'post',
                path: urlPath
            }
            var chunkList = [];
            var req = https.request(requestArg,
                function(rsp) {
                    rsp.setEncoding('utf8');
                    rsp.on('data',
                        function(chunk) {
                            chunkList.push(chunk);
                        });
                    rsp.on('error',
                        function(err) {
                            reject(err)
                        });
                    rsp.on('end',
                        function() {
                            rspBody = chunkList.join('');
                            try {
                                var rspJsonBody = JSON.parse(rspBody);
                            } catch(err) {
                                reject(err)
                                // if (callback) {
                                //     callback(err);
                                // }
                            }
                            resolve(rspJsonBody);
                            // if (callback) {
                            //     callback(null, rspJsonBody);
                            // }
                        });
                });
            req.write(JSON.stringify(reqBody));
            req.end();
        })
}

module.exports = TimRestAPI;
