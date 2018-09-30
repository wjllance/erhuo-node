let mongoose = require('mongoose');
let _ = require('lodash');
let myUtils = require("../tool/mUtils");
const school_map = require('../config').CONSTANT.SCHOOL_MAP;
const GOODS_STATUS = require('../config').CONSTANT.GOODS_STATUS;
// 商品
let goodsSchema = new mongoose.Schema({

    userID: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true,
    },

    gname: String,
    gsummary: String,
    glabel: String,
    gprice: Number,
    gpics: [{
        type: mongoose.Schema.ObjectId,
        ref: 'Image',
    }],
    npics: [String],
    category: {
        type: String,
        index: true,
        default: "其他",
    },
    gstype: String,
    glocation: {
        type: Number,
        default: 0,
    },
    gcost: Number,
    gcity: String,
    gpriority: { type: Number, default: 0 },
    created_date: { type: Date, default: Date.now },
    removed_date: { type: Date, default: null },   // 下架
    deleted_date: { type: Date, default: null },   // 删除
    updated_date: { type: Date, default: Date.now },

    status: { type: Number, default: 0 }, //审核状态0初，2不通过, 1已审核(其他)
    remark: String,


    is_special: Boolean,
    amount: Number,  //库存

    //new
    like_num: {
        type: Number,
        default: 0,
    },

    comment_num: {
        type: Number,
        default: 0,
    },


}, { versionKey: false });


goodsSchema.methods.baseInfoV2 = function (fullPic) {
    let g = _.pick(this, ['_id', 'gname', 'gsummary', 'glabel', 'gprice', 'gstype', 'gcost', 'category', 'updated_date', 'gpriority', 'like_num', 'comment_num']);
    if (this.npics && this.npics.length > 0) {
        if (fullPic) {
            g.gpics = this.npics.map(x => {
                return {
                    url: x,
                    thumb: myUtils.thumbnail(x, 720),
                    // thumb: x+"?imageMogr2/thumbnail/720x",

                };
            });
        } else {
            g.gpics = [];
            // g.gpics[0] = this.npics[0]+"?imageMogr2/thumbnail/200x";

            g.gpics[0] = myUtils.thumbnail(this.npics[0]);
        }
    } else if (this.gpics) {
        if (fullPic) {
            g.gpics = this.gpics.map(y => y.urlV2());
        } else {
            g.gpics = [];
            g.gpics[0] = this.gpics[0].thumb();
        }
    }
    if (this.userID._id) {
        g.user = this.userID.cardInfo();
    }

    // g.state = this.removed_date ? "已下架" : "在售";
    g.created_date = myUtils.dateStr(this.created_date);
    g.glocation = school_map[this.glocation];

    g.state = getGoodsState(this);
    return g;
};

//deprecated
goodsSchema.methods.baseInfo = function (fullPic) {
    let g = _.pick(this, ['_id', 'like_num', 'comment_num', 'gname', 'gsummary', 'glabel', 'gprice', 'gstype', 'gcost', 'category', 'updated_date', 'gpriority']);
    if (fullPic) {
        g.gpics = this.gpics.map(y => y.url());
    } else {
        g.gpics = [];
        g.gpics[0] = this.gpics[0].thumb();

    }
    // g.state = this.removed_date ? "已下架" : "在售";
    g.created_date = myUtils.dateStr(this.created_date);
    g.glocation = school_map[this.glocation];

    g.state = getGoodsState(this);
    return g;
};

goodsSchema.methods.cardInfo = function () {
    let g = _.pick(this, ['_id', 'like_num', 'comment_num', 'gname', 'gsummary', 'glabel', 'gprice', 'gstype', 'gcost', 'category', 'updated_date', 'gpriority', 'is_special']);
    if (this.npics && this.npics.length > 0) {
        g.gpics = [];
        // g.gpics[0] = this.npics[0] + "?imageMogr2/thumbnail/200x";

        g.gpics[0] = myUtils.thumbnail(this.npics[0]);
    }
    else if (this.gpics) {
        g.gpics = [];
        g.gpics[0] = this.gpics[0].thumb();
        // g.state = this.removed_date ? "已下架" : "在售";
    }

    g.created_date = myUtils.dateStr(this.created_date);
    g.glocation = school_map[this.glocation];
    if (this.userID._id) {
        g.user = this.userID.cardInfo();
    }

    g.state = getGoodsState(this);

    return g;
};

goodsSchema.methods.myRemove = async function () {
    this.removed_date = Date.now();
    this.status = GOODS_STATUS.UNDERCARRIAGE;
    await this.save();
};


let getGoodsState = (self) => {

    if (self.status === GOODS_STATUS.REJECT)
        return "审核下架";

    return self.removed_date ? "已下架" : "在售";

    // switch (self.status){
    //     case GOODS_STATUS.INIT:
    //         return "待审核";
    //     case GOODS_STATUS.PASS:
    //         return "待发布";
    //     case GOODS_STATUS.REJECT:
    //     	return "审核未通过";
    //     case GOODS_STATUS.RELEASED:
    //         return "已发布";
    //     case GOODS_STATUS.UNDERCARRIAGE:
    //         return "已下架";
    // default:
    // 	return self.removed_date ? "已下架" : "在售"
    // }
};

module.exports = mongoose.model("Goods", goodsSchema);
