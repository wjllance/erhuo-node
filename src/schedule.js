const schedule = require('node-schedule');
let moment = require('moment');
moment.locale('zh-cn');
const myUtils = require("./myUtils/myUtil");
const {Transaction, Order, Goods} = require('./models');
const srv_transaction = require('./services/transaction')
const srv_order = require('./services/order');
let path = require('path');
let fs = require('fs');

let config = require('./config');
const AV = require('leancloud-storage');
AV.init({
    appId: config.LEAN_APPID,
    appKey: config.LEAN_APPKEY,
    masterKey: config.LEAN_MASTERKEY
});
exports.register = function () {
    console.log("register!");

    scheduleOrderCountDown();

    scheduleOrderTimeout();

    scheduleGoodsExamine();

    scheduleOldPicsUpload();

    scheduleOrderImgUpdate();
};

let scheduleGoodsExamine = () =>{
    schedule.scheduleJob('*/10 * * * * *', async function(){
        // schedule.scheduleJob('*/5 * * * * *', async function(){
        console.log('checking goods passed...');
        let ddl = moment({hour:20});
        if(moment().isBefore(ddl)){
            ddl = ddl.subtract(1,'d');
        }
        // ddl = moment().subtract(30,'s');
        let condi = {
            status: {
                $in: [
                    config.CONSTANT.GOODS_STATUS.PASS,
                    config.CONSTANT.GOODS_STATUS.INIT
                ]
            },
            created_date: {$lt: ddl}
        };
        // console.log(condi);
        let goods = await Goods.find(condi);
        // console.log(goods);
        if(goods.length > 0){
            console.log("updating...count:",goods.length);
            await Goods.updateMany(condi,{
                status: config.CONSTANT.GOODS_STATUS.RELEASED
            })
        }

    });
};


let scheduleOldPicsUpload = () =>{
    schedule.scheduleJob('*/30 * * * * *', async function(){

        let goodsall = await Goods.find({"npics.0":{$exists:false}}).sort({created_date:-1}).populate('gpics').limit(3);

        let goodscount = await Goods.find({"npics.0":{$exists:false}}).count();
        console.log("checking old pics upload...", goodscount);
        for (let j = 0; j < 3 && j < goodsall.length; j++) {
            let goods = goodsall[j];
            let npics = [];
            for (let i = 0; i < goods.gpics.length; i++){
                let name = goods.gpics[i]._id+".jpg";
                let fpath = path.join(config.PUBLIC.root, goods.gpics[i].filename);
                try{
                    let img = fs.readFileSync(fpath);
                    let file = new AV.File(name, img);
                    let res = await file.save();
                    npics.push(res.url());
                }catch (e) {
                    console.error(goods._id, e)
                }
            }
            goods.npics = npics;
            await goods.save();
            console.log(goods);
        }


        let regex = new RegExp('lcfile', 'i');
        goodsall = await Goods.find({"npics.0":regex}).limit(3);
        goodscount = await Goods.find({"npics.0":regex}).count();

        console.log("updating old pics urls...", goodscount);
        for (let j = 0; j<goodsall.length; j++){
            let goods = goodsall[j];
            npics = [];
            for (let i = 0; i < goods.npics.length; i++) {
                let fn = path.basename(goods.npics[i]);
                npics.push("https://two.jicunbao.com/"+fn)
            }
            goods.npics = npics;
            await goods.save();
            console.log(goods);
        }
    });
}



let scheduleOrderImgUpdate = () =>{
    schedule.scheduleJob('*/40 * * * * *', async function(){

        let regex = new RegExp('tmb', 'i');
        let orders = await Order.find({"goodsInfo.img": regex}).populate('goodsId').sort({created_date:-1}).limit(3);

        let orderscount = await Order.find({"goodsInfo.img": regex}).count();
        console.log("checking old orders img update...", orderscount);
        for (let j = 0; j < 3 && j < orders.length; j++) {
            let order = orders[j];
            try {

                order.goodsInfo.img = myUtils.thumbnail(order.goodsId.npics[0]);
                order.markModified("goodsInfo");
                await order.save();
                console.log(order);
            }catch (e) {
                console.error(order.goodsId);
                await order.remove();
            }
        }

    });
}

let scheduleOrderTimeout = ()=>{
    schedule.scheduleJob('0 */1 * * * *', async function() {
        // schedule.scheduleJob('*/5 * * * * *', async function(){
        console.log('checking order timeout...');
        let orders = await Order.find({
            updated_date: {
                $lt: moment().subtract(15, 'm')
            },
            order_status: config.CONSTANT.ORDER_STATUS.TOPAY
        });
        console.log(orders);
        for (let i = 0; i < orders.length; i++) {
            await srv_order.cancel(orders[i]);
        }
    })
};

let scheduleOrderCountDown = ()=>{
    if(config.ENV === "local") {
        schedule.scheduleJob('*/30 * * * * *', async function(){
            console.log('checking normal order countdown...');
            let transactions = await Transaction.find({
                countdown_date: {
                    $lt: moment().subtract(30, 's')
                },
                status: config.CONSTANT.TRANSACTION_STATUS.INIT,
                finished_date: {$exists: false}
            });
            console.log(transactions);
            for(let i = 0; i< transactions.length; i++){
                await srv_order.finish(transactions[i].orderId);
                await srv_transaction.finish(transactions[i]);
            }
        });



    }else{
        schedule.scheduleJob('0 */10 * * * *', async function(){
            console.log('checking normal order countdown...');
            let transactions = await Transaction.find({
                countdown_date: {
                    $lt: moment().subtract(71, 'h').subtract(50, 'm')
                },
                status: config.CONSTANT.TRANSACTION_STATUS.INIT,
                finished_date: {$exists: false}
            });
            console.log(transactions);
            for(let i = 0; i< transactions.length; i++){
                await srv_order.finish(transactions[i].orderId);
                await srv_transaction.finish(transactions[i]);
            }
        });

    }
};

