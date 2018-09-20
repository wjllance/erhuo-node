require("should");
let Router = require("koa-router");
let auth = require("../services/auth");
let getlocation = require("../services/getlocation");
const router = module.exports = new Router();


router.post("/location/Groom",auth.loginRequired,async (ctx,next) => {
    let params = ctx.request.body;
    auth.assert(params.longitude && params.latitude , "缺少参数");
    console.log("saa"+params.longitude);
    var x = params.longitude;
    var y = params.latitude;
    let name  =  await getlocation.getlocation(x,y);
    let cityName = name.result.address_component.city;
    console.log(name.result.address_component.city);
    let resultSet = await getlocation.universityList(cityName);
    console.log(resultSet);
    ctx.body = {
        success: 1,
        data: resultSet
    }
});
