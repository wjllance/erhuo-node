
require('should');
let Router = require('koa-router');

let config = require('../config');
let _ = require('lodash');
const router = module.exports = new Router();

router.get('/ping', async ctx => {
    ctx.body = {
        data: 'pong'
    }
});


router.get('/schools', async(ctx, next) =>{
    let schools = config.CONSTANT.SCHOOL_MAP;
    let ret = _.map(schools, (p) =>{
        return {
            name: p,
            show: false
        }
    });
    ret.splice(0,2);
    ctx.body = {
        success:1,
        data:ret
    }
});

