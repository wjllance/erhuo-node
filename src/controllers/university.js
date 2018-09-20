require("should");
let Router = require("koa-router");
let auth = require("../services/auth");
let srv_university = require("../services/university");
const router = module.exports = new Router();


router.post("/university/groom",auth.loginRequired,async (ctx,next) => {
    let params = ctx.request.body;
    auth.assert(params.longitude && params.latitude , "缺少参数");
    let x = params.longitude;
    let y = params.latitude;
    let cityName = await srv_university.getCityName(x,y);
    let resultSet = await srv_university.universityList(cityName);
    console.log("nearest university list", resultSet);
    ctx.body = {
        success: 1,
        data: resultSet
    }
});

router.post("/location/Groom",auth.loginRequired,async (ctx,next) => {
    let params = ctx.request.body;
    auth.assert(params.longitude && params.latitude , "缺少参数");
    let x = params.longitude;
    let y = params.latitude;
    let cityName = await srv_university.getCityName(x,y);
    let resultSet = await srv_university.universityList(cityName);
    console.log("nearest university list", resultSet);
    ctx.body = {
        success: 1,
        data: resultSet
    }
});