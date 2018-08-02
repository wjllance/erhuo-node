
require('should');
let Router = require('koa-router');

let config = require('../config');
let _ = require('lodash');

let {  User } = require('../models');

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

router.get('/schools/population/:name', async(ctx, next)=>{
    let name = ctx.params.name;
    let schoolIdx = config.CONSTANT.SCHOOL_MAP.indexOf(name);
    console.log(schoolIdx);
    let population = await User.find({location:schoolIdx}).count();
    ctx.body = {
        success:1,
        data:population
    }
})

router.post('/schools/population', async(ctx, next)=>{
    let name = ctx.request.body.name;
    let schoolIdx = config.CONSTANT.SCHOOL_MAP.indexOf(name);
    console.log(schoolIdx);
    let population = await User.find({location:schoolIdx}).count();
    ctx.body = {
        success:1,
        data:population
    }
})

