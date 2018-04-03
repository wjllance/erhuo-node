
require('should');
let Router = require('koa-router');

let _ = require('lodash');
let mzfs = require('mz/fs');
let path = require('path');
let body = require('koa-convert')(require('koa-better-body')());

let config = require('../config');
let auth = require('../services/auth');
let { User, Image } = require('../models');

const router = module.exports = new Router();

// 上传图片
router.post('/images/upload', auth.loginRequired, body, async (ctx, next) => {
    let image_file = ctx.request.fields.image ? ctx.request.fields.image[0] : null;
    auth.assert(image_file, '没有图片文件');

    let image = await Image.create({userID: ctx.state.user._id});
    image.filename = config.PUBLIC.images + '/' + image._id.toString() + path.extname(image_file.name);
    await mzfs.rename(image_file.path, path.join(config.PUBLIC.root, image.filename));
    await image.save();

    ctx.body = {
        success: 1,
        data: image._id.toString()
    };
});
