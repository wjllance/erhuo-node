
let should = require('should');
let _ = require('lodash');
let yaml = require('js-yaml');
let path = require('path');
let fs = require('fs');
let Log = require('log');

let config = yaml.safeLoad(fs.readFileSync(path.join(__dirname, '..', 'config.yml'), 'utf-8'));

let log = exports.log = new Log('info');

let SERVER = exports.SERVER = _.pick(config['SERVER'], ['ADDRESS', 'PORT', 'URL_PREFIX', 'SECRET_KEYS', 'MAXAGE']);

// 数据库相关
if ('MONGO_HOST' in process.env) { // for docker
	exports.MONGODB_URL = `mongodb://${process.env['MONGO_HOST']}/${config['MONGODB']['DATABASE']}`;
} else {
	exports.MONGODB_URL = `mongodb://${config['MONGODB']['HOSTNAME']}/${config['MONGODB']['DATABASE']}`;
}

exports.APP_ID = config['APP_ID'];
exports.APP_SECRET = config['APP_SECRET'];
exports.ENV = config['ENV'];


exports.SA_APP_ID = config['SA_APP_ID'];
exports.SA_SECRET = config['SA_SECRET'];
exports.SA_TOKEN = config['SA_TOKEN'];

exports.CONSTANT = {
    SCHOOL:{
        ALL:0,
        PKU:2,
        THU:3,
        OTHER: 1,
    },
    ORDER_STATUS:{
        TOPAY: 0,
        PAID: 1,
        COMPLET: 2,
    },
    PAY_STATUS: {
        INIT: 0,
        SUCCEED: 1,
        FAILED: 2,
        TIMEOUT: 3
    },
    REFUND_STATUS: {
        INIT: 0,
        APPLYING: 1,
        SUCCEED: 2,
        FAILED: 3,
    },
    SCHOOL_MAP:["全部", "其他院校","北京大学","清华大学"]
};

let PUBLIC = exports.PUBLIC = {
    root: path.join(__dirname, '..', config['PUBLIC']),
    images: 'images'
}
if (!fs.existsSync(PUBLIC.root)) fs.mkdirSync(PUBLIC.root);
if (!fs.existsSync(path.join(PUBLIC.root, PUBLIC.images))) fs.mkdirSync(path.join(PUBLIC.root, PUBLIC.images));