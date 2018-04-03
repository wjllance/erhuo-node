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

let app = new Koa();

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

app.use(router.routes());
app.use(require('koa-static')(PUBLIC.root, {
    maxage: SERVER.MAXAGE
}));

app.listen(SERVER.PORT, SERVER.ADDRESS);

log.info(`listen on http://${SERVER.ADDRESS}:${SERVER.PORT}`);