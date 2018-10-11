require('should');
let Router = require('koa-router');

let config = require('../config');
let _ = require('lodash');

let { User, University } = require('../models');

const router = module.exports = new Router();


router.get('/ping', async ctx => {
    ctx.body = {
        data: 'pong',
    };
});


router.get('/schools', async (ctx, next) => {
    let schools = await University.find();
    ctx.body = {
        success: 1,
        data: _.map(schools, s => {
            return {
                name: s.name,
                show: false,
            };
        }),
    };
});

router.get('/schools/population/:name', async (ctx, next) => {
    let name = ctx.params.name;

    let university = await University.findOne({ name });
    console.log(university);
    // let schoolIdx = config.CONSTANT.SCHOOL_MAP.indexOf(name);

    let population = await User.find({ location: university.locationNum }).count();
    ctx.body = {
        success: 1,
        data: population,
    };
});

router.post('/schools/population', async (ctx, next) => {
    let name = ctx.request.body.name;

    let university = await University.findOne({ name });
    // let schoolIdx = config.CONSTANT.SCHOOL_MAP.indexOf(name);
    console.log(university);
    let population = await User.find({ location: university.locationNum }).count();
    ctx.body = {
        success: 1,
        data: population,
    };
});

