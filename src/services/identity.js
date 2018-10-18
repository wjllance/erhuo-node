let _ = require("lodash");
let Identity = require('../models/identity');
let User = require('../models/user');
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
        console.log(identitys[i]);
        console.log("+++++++++++++++++++++++++++++")
        let userId = identitys[i].userID;
        let user = await User.findOne({_id : userId});
        identity[i].avatarUrl = user.avatarUrl;
        identity[i].nickName = user.nickName;
    }
    return {
        users: identity,
        hasMore: hasMore,
        total: total,
    };
};