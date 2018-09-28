// 网站

let _ = require('lodash');
let Koa = require('koa');
let mount = require('koa-mount');
let bodyParser = require('koa-bodyparser');
let path = require('path');
let session = require('koa-session');
let config = require('./config');
let { log, SERVER, PUBLIC } = require('./config');
const logUtil = require('./myUtils/logUtil');
let app = new Koa();
const router2controller = require('./router2controller.js');
let schedule = require('./schedule');


const xmlParser = require('koa-xml-body');
app.use(xmlParser()).use((ctx,next) => {
    ctx.data = ctx.request.body;
    return next();
});

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
    formLimit: '10MB',
    enableTypes: ['json', 'form', 'text'],
    extendTypes: {
        text: ['text/xml', 'application/xml']
    }
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

app.use(router2controller());

app.use(require('koa-static')(PUBLIC.root, {
    maxage: SERVER.MAXAGE
}));


logUtil.initLogPath();


console.log("NODE APP INSTANCE", process.env.NODE_APP_INSTANCE)
if (process.env.NODE_APP_INSTANCE === '0') {
    // 定时任务
    schedule.register();
}

app.listen(SERVER.PORT, SERVER.ADDRESS);

log.info(`listen on http://${SERVER.ADDRESS}:${SERVER.PORT}`);



