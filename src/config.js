
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
    exports.MONGODB_URL = `mongodb://${config['MONGODB']['USERNAME']}:${config['MONGODB']['PASSWORD']}@${config['MONGODB']['HOSTNAME']}/${config['MONGODB']['DATABASE']}`;
    //exports.MONGODB_URL = `mongodb://@${config['MONGODB']['HOSTNAME']}/${config['MONGODB']['DATABASE']}`;
}
let ROOTPATH = exports.ROOT_PATH = path.join(__dirname, '../');

exports.APP_ID = config['APP_ID'];
exports.APP_SECRET = config['APP_SECRET'];
exports.ENV = config['ENV'];

exports.MCH_ID = ""+config['MCH_ID'];
exports.API_KEY = config['API_KEY'];
exports.CERT_PATH = path.join(ROOTPATH, config['CERT_PATH']);

exports.SA_APP_ID = ""+config['SA_APP_ID'];
exports.SA_SECRET = config['SA_SECRET'];
exports.SA_TOKEN = config['SA_TOKEN'];

// exports.IMSDK_APPID = ""+config['IMSDK_APPID'];
// exports.IMACCOUNT_TYPE = ""+config['IMACCOUNT_TYPE'];

exports.LEAN_APPID = config['LEAN_APPID'];
exports.LEAN_MASTERKEY = config['LEAN_MASTERKEY'];


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
        WRONG_FEE: 4
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
    SCHOOL_MAP:[
        "全部",   //0
        "其他院校",
        "北京大学",
        "清华大学",
        "北京师范大学",   //4
        "中国人民大学",
        "北京林业大学",
        "中国农业大学",
        "北京交通大学",
        "中央民族大学",
        "首都师范大学",
        "北京工商大学",
        "中国矿业大学",
        "中国地质大学",
        "北京语言大学",
        "北京邮电大学",
        "北京科技大学",
        "北京化工大学"

    ],
    ERR_CODE: {
        ERROR: 978,
        MSG_FAIL: 985
    },
    GOODS_STATUS:{
        INIT:0,             //待审核
        PASS:1,             //审核通过
        REJECT:2,           //审核失败
        RELEASED:3,         //已发布
        UNDERCARRIAGE:4     //下架
    }
};


let PUBLIC = exports.PUBLIC = {
    root: path.join(__dirname, '..', config['PUBLIC']),
    images: 'images'
}
if (!fs.existsSync(PUBLIC.root)) fs.mkdirSync(PUBLIC.root);
if (!fs.existsSync(path.join(PUBLIC.root, PUBLIC.images))) fs.mkdirSync(path.join(PUBLIC.root, PUBLIC.images));