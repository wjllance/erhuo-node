
require('should');
let Router = require('koa-router');
let fs = require('fs');
let _ = require('lodash');
let mzfs = require('mz/fs');
let path = require('path');
let body = require('koa-convert')(require('koa-better-body')());
let config = require('../config');
let auth = require('../services/auth');
let { User, Image, Goods } = require('../models');
const sharp = require('sharp');
const mUtils = require('../tool/mUtils');

const router = module.exports = new Router();
let moment = require('moment');
moment.locale('zh-cn');

const AV = require('leancloud-storage');
AV.init({
    appId: config.LEAN_APPID,
    appKey: config.LEAN_APPKEY,
    masterKey: config.LEAN_MASTERKEY
});


// 上传图片
router.post('/images/upload', auth.loginRequired, body, async (ctx, next) => {
    let image_file = ctx.request.fields.image ? ctx.request.fields.image[0] : null;
    auth.assert(image_file, '没有图片文件');

    let image = await Image.create({userID: ctx.state.user._id});
    image.filename = config.PUBLIC.images + '/' + image._id.toString() + path.extname(image_file.name);
    image.thumbnails = config.PUBLIC.images + '/' + image._id.toString() + "_tmb"+ path.extname(image_file.name);


    console.log(image_file.path)
    await sharp(image_file.path)
        .resize(200)
        .toFile(path.join(config.PUBLIC.root, image.thumbnails));
    await mzfs.rename(image_file.path, path.join(config.PUBLIC.root, image.filename));
    await image.save();


    ctx.body = {
        success: 1,
        data: image._id.toString()
    };
});


router.post('/images/uploadByAdmin/:openid', body, async (ctx, next) => {
    let image_file = ctx.request.fields.image ? ctx.request.fields.image[0] : null;
    auth.assert(image_file, '没有图片文件');
    let user = await User.findOne({openid: ctx.params.openid});
    console.log(user);
    auth.assert(user && user.isAdmin, "不是管理员");

    let image = await Image.create({userID: user._id});
    image.filename = config.PUBLIC.images + '/' + image._id.toString() + path.extname(image_file.name);
    image.thumbnails = config.PUBLIC.images + '/' + image._id.toString() + "_tmb"+ path.extname(image_file.name);


    console.log(image_file.path)
    await sharp(image_file.path)
        .resize(200)
        .toFile(path.join(config.PUBLIC.root, image.thumbnails));
    await mzfs.rename(image_file.path, path.join(config.PUBLIC.root, image.filename));
    await image.save();


    ctx.body = {
        success: 1,
        data: image._id.toString()
    };
});


router.post('/v2/images/upload', auth.loginRequired, body, async (ctx, next) => {

    let image_file = ctx.request.fields.image ? ctx.request.fields.image[0] : null;
    auth.assert(image_file, '没有图片文件');

    let img = fs.readFileSync(image_file.path);
    let file = new AV.File(image_file.name, img);
    let res = await file.save();
    console.log(res);
    ctx.body = {
        success: 1,
        data: res.url()
    };
});

router.post('/v2/images/upload_pic_url', auth.loginRequired, async (ctx, next) => {

    let imgUrl = ctx.request.body.img;
    auth.assert(imgUrl, '没有图片链接');

    let res = await mUtils.uploadImgByUrl(imgUrl);

    ctx.body = {
        success: 1,
        data: res
    };

});

router.post('/v2/images/uploadByAdmin/:openid', body, async (ctx, next) => {
    let image_file = ctx.request.fields.image ? ctx.request.fields.image[0] : null;
    auth.assert(image_file, '没有图片文件');
    let user = await User.findOne({openid: ctx.params.openid});
    console.log(user);
    auth.assert(user && user.isAdmin, "不是管理员");


    let img = fs.readFileSync(image_file.path);
    let file = new AV.File(image_file.name, img);
    let res = await file.save();
    console.log(res);
    ctx.body = {
        success: 1,
        data: res.url()
    };

});

