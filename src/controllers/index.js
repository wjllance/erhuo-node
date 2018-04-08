
require('should');
let Router = require('koa-router');

const router = module.exports = new Router();

router.get('/ping', async ctx => {
    ctx.body = {
        data: 'pong'
    }
});

