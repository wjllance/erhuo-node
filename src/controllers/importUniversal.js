require('should');
let Router = require('koa-router');

let {University} = require('../models');
var fs = require("fs");
var read_xlsx = require("../services/read_xlsx");
var excelBuffer = fs.readFileSync("./daxue.xlsx");
//返回Promise对象
const router = module.exports = new Router();
router.post("/importexcelxlsx", async (ctx, next) => {
    read_xlsx.getWorkbook(excelBuffer).then(function (workbook) {
        //获得所有工作簿名称
        var sheetNames = workbook.getSheetNames();
        //获得名称为Sheet1的工作簿
        workbook.getSheet(sheetNames[0]).then(function (sheet) {
            //获得总行数
            var rowLen = sheet.getRows();
            //获得总列数
            var cellLen = sheet.getColumns();
            //遍历所有单元格
            var data = [
                ['name', 'idcode', 'superior', 'location', 'hierarchy', 'remarks'],
            ];
            out : for (var i = 0; i < rowLen; i++) {
                for (var k = 0; k < cellLen; k++) {
                    var cell = sheet.getCell(i, k);
                    //If the cell is empty, it is possible that the cell does not exist return null!
                    data[k] = cell.getContents();
                    if (sheet.getCell(i, 0) == null) {
                        break out;
                    }
                    //打印单元格内容
                    // console.log(cell.getName() + ":" + cell.getContents());
                }
                let university = new University({
                    name: data[0],
                    idcode: data[1],
                    superior: data[2],
                    location: data[3],
                    hierarchy: data[4],
                    remarks: data[5]
                });
                university.save();
            }
            // //find cell by name 通过名称获得某个单元格
            // var a1Sheet = sheet.findCell("A1");
            // var a1Str = a1Sheet.getContents();
            // console.log(a1Str)
        })["catch"](function (err) {
            console.error(err.stack);
        });
    });
});