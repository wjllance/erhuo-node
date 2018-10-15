require("should");
let Router = require("koa-router");
let auth = require("../services/auth");
let srv_university = require("../services/university");
const router = module.exports = new Router();

/**
 * @api {post} /location/Groom  定位推荐
 * @apiName     UniversityList
 * @apiGroup    University
 *
 *
 * @apiParam    {Number}    longitude   经度
 * @apiParam    {Number}    latitude     纬度
 *
 * @apiSuccess  {Number}    name        api返回的地址信息
 * @apiSuccess  {String}    cityName     取出的市名
 * @apiSuccess  {Object[]}     resultSet  推荐的学校列表
 *
 */
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