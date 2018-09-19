require("should");
let Router = require("koa-router");
let auth = require("../services/auth");
let getlocation = require("../services/getlocation");
const router = module.exports = new Router();


router.post("/getlocationGroom",auth.loginRequired,async (ctx,next) => {
    let params = ctx.request.body;
    auth.assert(params.longitude && params.latitude , "缺少参数");
    console.log("saa"+params.longitude);
    var x = params.longitude;
    var y = params.latitude;


    var name  =  getlocation.getlocation(x,y);
    console.log("bbbbb");
    console.log(name+"ffsdfds");

});
