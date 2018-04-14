const fs = require('fs');
let auth = require('./services/auth');
let Router = require('koa-router');

let router = new Router();
router.use(require('koa-logger')());
router.use(auth.visit);
router.use(auth.userM);

function addControllers(router, dir) {
    fs.readdirSync(__dirname + '/' + dir).filter((f) => {
        return f.endsWith('.js');
    }).forEach((f) => {
        console.log(`process controller: ${f}...`);
        let routes = require(__dirname + '/' + dir + '/' + f).routes();
        router.use("", routes);
    });
}

module.exports = function (dir) {
    var controllersDir = dir || 'controllers';
    addControllers(router, controllersDir);
    return router.routes();
};