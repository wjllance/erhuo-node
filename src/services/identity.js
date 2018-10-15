let _ = require("lodash");
let Identity = require('../models/identity');
exports.userList = async (pageNo, pageSize) => {

    let sorti = {
        created_date: -1,
    };
    let total = await Identity.find().count();//表总记录数

    let identitys= await Identity.find()
        .sort(sorti)
        .limit(pageSize)
        .skip((pageNo - 1) * pageSize)
    let hasMore = total - pageNo * pageSize > 0;
    let identity =[];
    for(var i=0;i<identitys.length;i++){
        identity[i]= _.pick(identitys[i], ["name", "studentID", "school", "ncard", "nwithcard","status",'userID']);
    }
    return {
        users: identity,
        hasMore: hasMore,
        total: total,
    };
};