
let _ = require('lodash');
require('should');
let moment = require('moment')

exports.bindFindByXX = (objs, XX) => {
    objs.should.be.instanceOf(Array);
    XX.should.be.a.String();

    const index_name = `${XX}_indxes`;
    const func_name = `findBy${XX}`;

    objs[index_name] = {};
    objs.forEach(x => {
        objs[index_name][String(x[XX])] = x;
    });

    objs[func_name] = (id) => {
        id = String(id);
        if (id in objs[index_name]) return objs[index_name][id];
        else return null;
    }
}

exports.buildBinarySearch = (items) => {
    items._items_index = _.clone(items);
    items._items_index.sort();
    items.binarySearch = (v) => {
        return _.sortedIndexOf(items._items_index, v) != -1;
    }
}

/**
 * 毫秒转换友好的显示格式
 * 输出格式：21小时前
 * @param  {[type]} time [description]
 * @return {[type]}      [description]
 */
exports.dateStr = (date) => {
    //获取js 时间戳
    var time=new Date().getTime();
    //去掉 js 时间戳后三位，与php 时间戳保持一致
    // console.log(time+" "+date.getTime())
    time=parseInt((time-date.getTime())/1000);

    //存储转换值
    var s;
    if(time<60*10){//十分钟内
        return '刚刚';
    }else if((time<60*60)&&(time>=60*10)){
        //超过十分钟少于1小时
        s = Math.floor(time/60);
        return  s+"分钟前";
    }else if((time<60*60*24)&&(time>=60*60)){
        //超过1小时少于24小时
        s = Math.floor(time/60/60);
        return  s+"小时前";
    }else if((time<60*60*24*3)&&(time>=60*60*24)){
        //超过1天少于3天内
        s = Math.floor(time/60/60/24);
        return s+"天前";
    }else{
        //超过3天
        // var date= new Date(parseInt(date) * 1000);
        return moment(date).format('ll')
        // return date.getFullYear()+"-"+(date.getMonth()+1)+"-"+date.getDate();
    }
}