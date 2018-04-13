// 网站

let _ = require('lodash');
let Koa = require('koa');
let Router = require('koa-router');
let mount = require('koa-mount');
let bodyParser = require('koa-bodyparser');
let path = require('path');
let session = require('koa-session');
let config = require('./config');
let { log, SERVER, PUBLIC } = require('./config');
let auth = require('./services/auth');
const logUtil = require('./services/log_util');
let app = new Koa();



//logger
app.use(async (ctx, next) => {
    //响应开始时间
    const start = new Date();
    //响应间隔时间
    var ms;
    try {
        //开始进入到下一个中间件
        await next();

        ms = new Date() - start;
        //记录响应日志
        logUtil.logResponse(ctx, ms);

    } catch (error) {

        ms = new Date() - start;
        //记录异常日志
        logUtil.logError(ctx, error, ms);
    }
});

app.use(bodyParser({
    formLimit: '10MB'
}));
app.keys = [config.SERVER.SECRET_KEYS];
const CONFIG = {
    key: 'c2c:sess', /** (string) cookie key (default is koa:sess) */
    /** (number || 'session') maxAge in ms (default is 1 days) */
    /** 'session' will result in a cookie that expires when session/browser is closed */
    /** Warning: If a session cookie is stolen, this cookie will never expire */
    maxAge: 86400000,
    overwrite: true, /** (boolean) can overwrite or not (default true) */
    httpOnly: false, /** (boolean) httpOnly or not (default true) */
    signed: true, /** (boolean) signed or not (default true) */
    rolling: false, /** (boolean) Force a session identifier cookie to be set on every response. The expiration is reset to the original maxAge, resetting the expiration countdown. (default is false) */
    renew: false, /** (boolean) renew session when session is nearly expired, so we can always keep user logged in. (default is false)*/
};
app.use(session(CONFIG, app));

app.use(async (ctx, next) => {
    ctx.state.ip = ctx.headers['x-real-ip'] || ctx.ip;
    await next();
});

let router = new Router();

router.use(require('koa-logger')());
router.use(auth.visit);
router.use(auth.userM);

router.use('', require('./controllers/index').routes());
router.use('', require('./controllers/users').routes());
router.use('', require('./controllers/resource').routes());
router.use('', require('./controllers/goods').routes());
router.use('', require('./controllers/comment').routes());
router.use('', require('./controllers/center').routes());

app.use(router.routes());
app.use(require('koa-static')(PUBLIC.root, {
    maxage: SERVER.MAXAGE
}));



var fs = require('fs');
var logConfig = require('./log_config');

/**
 * 确定目录是否存在，如果不存在则创建目录
 */
var confirmPath = function(pathStr) {

    if(!fs.existsSync(pathStr)){
        fs.mkdirSync(pathStr);
        console.log('createPath: ' + pathStr);
    }
}

/**
 * 初始化log相关目录
 */
var initLogPath = function(){
    //创建log的根目录'logs'
    if(logConfig.baseLogPath){
        confirmPath(logConfig.baseLogPath)
        //根据不同的logType创建不同的文件目录
        for(var i = 0, len = logConfig.appenders.length; i < len; i++){
            if(logConfig.appenders[i].path){
                confirmPath(logConfig.baseLogPath + logConfig.appenders[i].path);
            }
        }
    }
}

initLogPath();

app.listen(SERVER.PORT, SERVER.ADDRESS);

log.info(`listen on http://${SERVER.ADDRESS}:${SERVER.PORT}`);



