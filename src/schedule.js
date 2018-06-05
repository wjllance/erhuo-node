const schedule = require('node-schedule');
let moment = require('moment');
moment.locale('zh-cn');
const {Transaction, Order, Goods} = require('./models');
const srv_transaction = require('./services/transaction')
const srv_order = require('./services/order')

let config = require('./config');

function scheduleCronstyle(){
    schedule.scheduleJob('30 * * * * *', function(){
        console.log('scheduleCronstyle:' + new Date());
    });
}

// scheduleCronstyle();

exports.register = function () {
    console.log("register!");
    if(config.ENV == "local") {
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


    schedule.scheduleJob('0 */1 * * * *', async function(){
    // schedule.scheduleJob('*/5 * * * * *', async function(){
        console.log('checking order timeout...');
        let orders = await Order.find({
            updated_date: {
                $lt: moment().subtract(15, 'm')
            },
            order_status: config.CONSTANT.ORDER_STATUS.TOPAY
        });
        console.log(orders);
        for(let i = 0; i< orders.length; i++){
            await srv_order.cancel(orders[i]);
        }




        console.log('checking goods passed...');
        let ddl = moment({hour:20});
        if(moment().isBefore(ddl)){
            ddl = ddl.subtract(1,'d');
        }
        let condi = {
            status:config.CONSTANT.GOODS_STATUS.PASS,
            created_date: {$lt: ddl}
        };
        let goods = await Goods.find(condi);
        if(goods.length > 0){
            console.log("updating...count:",goods.length);
            await Goods.updateMany(condi,{
                status: config.CONSTANT.GOODS_STATUS.RELEASED
            })
        }

    });

};

