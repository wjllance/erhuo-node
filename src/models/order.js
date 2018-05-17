let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let _ = require('lodash');

let moment = require('moment');
moment.locale('zh-cn');
let config = require('../config');
// let tools = require('../services/tools')
// let school_map = require('../config').CONSTANT.SCHOOL_MAP

// 商品
let orderSchema = new Schema({

    goodsId: {
        type : Schema.ObjectId,
        ref : 'Goods',
        required: true
    },
    buyer: {
        type : Schema.ObjectId,
        ref : 'User',
        required: true
    },
    seller: {
        type : Schema.ObjectId,
        ref : 'User',
    },
    // goods_pic: String,

    goodsInfo: Schema.Types.Mixed,
    sn: String,
    price: Number,
    priceGet: Number,
    order_status: {
        type: Number,
        default: -1   //INIT
    },
    pay_status: {
        type: Number,
        default: 0,     //INIT
    },
    refund_status:{
        type: Number,
        default: 0,     //INIT
    },
    paid_at: Date,
    refunded_at: Date,
    created_date: { type: Date, default: Date.now},
    updated_date: { type: Date, default: Date.now},


    // gcost: Number,
});

let getOrderState = (o) => {
    let state = "";
    switch (o.order_status)
    {
        case 0:
            state = "待支付";
            break;
        case 1:
            state = "已支付";
            break;
        case 2:
            state = "已发货";
            break;
        case 3:
            state = "已完成";
            break;
        case 4:
            state = "已取消";
            break;
    }
    if(o.pay_status > 1){
        switch (o.pay_status){
            case 2:
                state = "支付失败";
                break;
            case 3:
                state = "支付超时";
                break;
            case 4:
                state = "金额异常";
                break;
        }
        return state;
    }
    if(o.refund_status > 0){
        switch (o.refund_status){
            case 1:
                state = "审核中";
                break;
            case 2:
                state = "退款成功";
                break;
            case 3:
                state = "退款失败";
                break;
        }
    }
    return state;
}

orderSchema.methods.cardInfo = function() {

    let o = _.pick(this, ['_id', 'goodsInfo', 'goodsId', 'sn',
        'order_status', 'pay_status', 'refund_status']);
    o.created_date = moment(this.created_date).format("YY-MM-DD HH:mm:ss");
    if(this.buyer){
        o.buyer = _.pick(this.buyer, ['_id', 'nickName', 'avatarUrl'])
    }
    if(this.seller){
        o.seller = _.pick(this.seller, ['_id', 'nickName', 'avatarUrl'])
    }
    o.goodsInfo.img = config.SERVER.URL_PREFIX + '/' + o.goodsInfo.img;
    o.state = getOrderState(this);
    return o;
};

orderSchema.methods.detailInfo = function() {

    let o = _.pick(this, ['_id', 'goodsInfo', 'goodsId', 'sn',
        'order_status', 'pay_status', 'refund_status']);
    o.created_date = moment(this.created_date).format("YY-MM-DD HH:mm:ss");
    if(this.buyer){
        o.buyer = this.buyer.baseInfo();
    }
    if(this.seller){
        o.seller = this.seller.baseInfo();
    }
    o.goodsInfo.img = config.SERVER.URL_PREFIX + '/' + o.goodsInfo.img;
    o.state = getOrderState(this);
    return o;
};

module.exports = mongoose.model("Order", orderSchema);