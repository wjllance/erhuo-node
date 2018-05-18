const schedule = require('node-schedule');
let moment = require('moment');
moment.locale('zh-cn');
const {Transaction} = require('./models');
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
        schedule.scheduleJob('*/10 * * * * *', async function(){
            console.log('checking normal order countdown...');
            let transactions = await Transaction.find({
                countdown_date: {
                    $lt: moment().subtract(30, 's')
                },
                finished_date: {$exists: false}
            });
            console.log(transactions);
            for(let i = 0; i< transactions.length; i++){
                await srv_order.finish(transactions[i].orderId);
                await srv_transaction.finish(transactions[i]);
            }
        });
    }else{
        schedule.scheduleJob('* */30 * * * *', async function(){
            console.log('checking normal order countdown...');
            let transactions = await Transaction.find({
                countdown_date: {
                    $lt: moment().subtract(71, 'h').subtract(30, 'm')
                },
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

