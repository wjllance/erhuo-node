
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

let ROOTPATH = exports.ROOT_PATH = path.join(__dirname, '../');

exports.APP_ID = config['APP_ID'];
exports.APP_SECRET = config['APP_SECRET'];
exports.ENV = config['ENV'];


exports.ADMIN_APP_ID = config['ADMIN_APP_ID'];
exports.ADMIN_APP_SECRET = config['ADMIN_APP_SECRET'];

if ('MONGO_HOST' in process.env) { // for docker
    exports.MONGODB_URL = `mongodb://${process.env['MONGO_HOST']}/${config['MONGODB']['DATABASE']}`;
} else {
    exports.MONGODB_URL = `mongodb://${config['MONGODB']['USERNAME']}:${config['MONGODB']['PASSWORD']}@${config['MONGODB']['HOSTNAME']}/${config['MONGODB']['DATABASE']}`;
    //exports.MONGODB_URL = `mongodb://@${config['MONGODB']['HOSTNAME']}/${config['MONGODB']['DATABASE']}`;
}

exports.MCH_ID = ""+config['MCH_ID'];
exports.API_KEY = config['API_KEY'];
exports.CERT_PATH = path.join(ROOTPATH, config['CERT_PATH']);

exports.SA_APP_ID = ""+config['SA_APP_ID'];
exports.SA_SECRET = config['SA_SECRET'];
exports.SA_TOKEN = config['SA_TOKEN'];

// exports.IMSDK_APPID = ""+config['IMSDK_APPID'];
// exports.IMACCOUNT_TYPE = ""+config['IMACCOUNT_TYPE'];

exports.LEAN_APPID = config['LEAN_APPID'];
exports.LEAN_APPKEY = config['LEAN_APPKEY'];
exports.LEAN_MASTERKEY = config['LEAN_MASTERKEY'];


exports.YUNPIAN_KEY = config['YUNPIAN_KEY'];


exports.CONSTANT = {
    SCHOOL:{
        ALL:0,
        OTHER: 1,
        PKU:2,
        THU:3,
        BNU:4,
    },
    ORDER_STATUS:{
        TOPAY: 0,
        PAID: 1,
        CONFIRM: 2,
        COMPLETE: 3,
        CANCEL: 4,
        INIT: -1
    },
    PAY_STATUS: {
        INIT: 0,
        SUCCEED: 1,
        FAILED: 2,
        TIMEOUT: 3,
        WRONG_FEE: 4,
	      PAYING: 5,
    },
    REFUND_STATUS: {
        INIT: 0,
        APPLYING: 1,
        SUCCEED: 2,
        FAILED: 3,
    },
    TRANSACTION_TYPE: {
        WITHDRAW: 0,
        INCOME: 1,
        REFUND: 2,
    },
    TRANSACTION_STATUS:{
        INIT: 0,
        SUCCEED: 1,
        FAILED: 2
    },
    SCHOOL_MAP: require('./tool/school_list'),
    ERR_CODE: {
        ERROR: 978,
        MSG_FAIL: 985,
        NEED_AUTH: 996,
    },
    GOODS_STATUS:{
        INIT:0,             //待审核
        PASS:1,             //审核通过
        REJECT:2,           //审核失败
    },
    GOODS_CATE: ["美妆", "女装", "女鞋", "数码","配饰", "包包", "日用", "其他", "求购", "书籍"],
    required_population: 1,
};


let PUBLIC = exports.PUBLIC = {
    root: path.join(__dirname, '..', config['PUBLIC']),
    images: 'images'
}
if (!fs.existsSync(PUBLIC.root)) fs.mkdirSync(PUBLIC.root);
if (!fs.existsSync(path.join(PUBLIC.root, PUBLIC.images))) fs.mkdirSync(path.join(PUBLIC.root, PUBLIC.images));
