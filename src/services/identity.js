let _ = require("lodash");
let Identity = require('../models/identity');
let User = require('../models/user');
let moment = require('moment');

exports.userList = async (pageNo, pageSize) => {

    let sorti = {
        created_date: -1,
    };
    let total = await Identity.find().count();//表总记录数

    let identitys = await Identity.find()
        .sort(sorti)
        .limit(pageSize)
        .skip((pageNo - 1) * pageSize)
        .populate('userID');
    let hasMore = total - pageNo * pageSize > 0;

    let items = _.map(identitys, item => {
        let ret = _.pick(item, ["name", "studentID", "school", "ncard", "nwithcard", "status"]);
        // let ret = _.pick(item, ["_id","name", "studentID", "school", "status"]);
        ret.created_date = moment(item.created_date).format('lll');
        ret.user = item.userID.cardInfo();
        if (item.status === 1) {
            ret.state = '已通过';
        } else if (item.status === 2) {

            ret.state = '已拒绝';
        } else {
            ret.state = '待审核';
        }
        ret.state = item.status;
        return ret;
    });

    return {
        users: items,
        hasMore: hasMore,
        total: total,
    };
};