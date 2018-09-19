var libPth = "../services/lib/";
var DOMParser = require(libPth+'xmldom').DOMParser;
var Hzip = require(libPth+'hzip');
var co = require(libPth+"co");
var zlib = require("zlib");
var util = require("./lib/xlsx_util");
var MongoClient = require('mongodb').MongoClient;
var config = require('../config');
var inflateRawAysnc = util.fromStandard(zlib.inflateRaw,zlib);
var wrap = function(func) {
	return function() {
		var rvObj = func.apply(this,arguments);
		return co(rvObj);
	};
};

var Cell = function(cEl,sharedStringsArr) {
	var t = this;
	t.getName = function() {
		return cEl.getAttribute("r");
	};
	t.getRow = function() {
		var rName = cEl.getAttribute("r");
		var rowNum = Number(rName[1]);
		return rowNum;
	};
	t.getColumn = function() {
		var rName = cEl.getAttribute("r");
		var cellNum = util.charToNum(rName[0]);
		return cellNum;
	};
	t.getContents = function() {
		var content = null;
		var tStr = cEl.getAttribute("t");
		var vEl = cEl.getElementsByTagName("v")[0];
		if(vEl) {
			var vStr = vEl.textContent;
			if(tStr === "s") {
				content = sharedStringsArr[vStr];
			} else {
				content = vStr;
			}
		}
		return content;
	};
};
var Sheet = function(sheetEl,sheetDoc,sharedStringsArr,hzip) {
	var t = this;
	var worksheetEl = sheetDoc.documentElement;
	var sheetDataEl = worksheetEl.getElementsByTagName("sheetData")[0];
	var rowElArr = sheetDataEl.getElementsByTagName("row");
	t.getMergedCells = function() {
		
	};
	t.isHidden = function() {
		var state = sheetEl.getAttribute("state");
		return state === "hidden";
	};
	t.findCell = function(paramString) {
		if(paramString == null) return paramString;
		paramString = paramString.trim();
    var firstDigit = paramString.match(/\d/);
		var rowKey = paramString.substring(paramString.indexOf(firstDigit));
		for(var i=0; i<rowElArr.length; i++) {
			var rowEl = rowElArr[i];
			if(rowEl.getAttribute("r") !== rowKey) continue;
			var cElArr = rowEl.getElementsByTagName("c");
			for(var k=0; k<cElArr.length; k++) {
				var cEl = cElArr[k];
				if(cEl.getAttribute("r") === paramString) {
					var cell = new Cell(cEl,sharedStringsArr);
					return cell;
				}
			}
		}
		return null;
	};
	t.getCell = function(paramInt1,paramInt2) {
		if(util.isString(paramInt1)) return t.findCell(paramInt1);
		paramInt1++;
		var paramString = util.charPlus("A",paramInt2)+paramInt1;
		return t.findCell(paramString);
	};
	t.getRows = function() {
		var rowEl = rowElArr[rowElArr.length-1];
		var rowNum = Number(rowEl.getAttribute("r"));
		return rowNum;
	};
	t.getColumns = function() {
		var columns = 0;
		for(var i=0; i<rowElArr.length; i++) {
			var rowEl = rowElArr[i];
			var cElArr = rowEl.getElementsByTagName("c");
			var cEl = cElArr[cElArr.length-1];
			var crStr = cEl.getAttribute("r");
			var columnsTmp = util.charToNum(crStr[0]);
			if(columns < columnsTmp) columns = columnsTmp;
		}
		return columns;
	};
	t.getRow = function(paramInt) {
		var cellArr = [];
		var rowEl = rowElArr[paramInt];
		if(rowEl == null) return null;
		var cElArr = rowEl.getElementsByTagName("c");
		for(var k=0; k<cElArr.length; k++) {
			var cEl = cElArr[k];
			var cell = new Cell(cEl,sharedStringsArr);
			cellArr.push(cell);
		}
		return cellArr;
	};
	t.getColumn = function(paramInt) {
		var cellArr = [];
		for(var i=0; i<rowElArr.length; i++) {
			var rowEl = rowElArr[i];
			var cElArr = rowEl.getElementsByTagName("c");
			var cEl = cElArr[paramInt];
			if(cEl) {
				var cell = new Cell(cEl,sharedStringsArr);
				cellArr.push(cell);
			}
		}
		return cellArr;
	};
	t.getName = function() {
		return sheetEl.getAttribute("name");
	};
};
Sheet.getSheet = wrap(function*(sheetEl,sharedStringsArr,relsObj,hzip){
	var sheetId = sheetEl.getAttribute("sheetId");
	var sheetEny = undefined;
	if (relsObj) {
		var relId = sheetEl.getAttribute("r:id");
		var relTarget = relsObj[relId];
		if (relTarget) {
			sheetEny = hzip.getEntry("xl/" + relTarget);
		}
	}
	if (!sheetEny) {
		sheetEny = hzip.getEntry("xl/worksheets/sheet"+sheetId+".xml");
	}
	if(!sheetEny) return;
	var sheetBuf = yield inflateRawAysnc(sheetEny.cfile);
	var sheetDoc = new DOMParser().parseFromString(sheetBuf.toString(),'text/xml');
	var sheet = new Sheet(sheetEl,sheetDoc,sharedStringsArr,hzip);
	return sheet;
});

var Workbook = function(wkDoc,sharedStringsArr,relsObj,hzip) {
	var t = this;
	var docEl = wkDoc.documentElement;
	var sheetsEl = docEl.getElementsByTagName("sheets")[0];
	var sheetElArr = sheetsEl.getElementsByTagName("sheet");
	t.getSheets = wrap(function*(cb) {
		var sheetArr = [];
		for(var i=0; i<sheetElArr.length; i++) {
			var sheetEl = sheetElArr[i];
			var sheet = yield Sheet.getSheet(sheetEl,sharedStringsArr,relsObj,hzip);
			sheetArr.push(sheet);
		}
		return sheetArr;
	});
	t.getSheet = wrap(function*(paramString) {
		var isInt = Number.isInteger(paramString);
		if(isInt) {
			var sheetEl = sheetElArr[paramString];
			var sheet = yield Sheet.getSheet(sheetEl,sharedStringsArr,relsObj,hzip);
			return sheet;
		}
		var sheet0El = undefined;
		for(var i=0; i<sheetElArr.length; i++) {
			var sheetEl = sheetElArr[i];
			var name = sheetEl.getAttribute("name");
			if(name === paramString) {
				sheet0El = sheetEl;
				break;
			}
		}
		if(!sheet0El) return;
		var sheet = yield Sheet.getSheet(sheet0El,sharedStringsArr,relsObj,hzip);
		return sheet;
	});
	t.getSheetNames = function() {
		var sheetNames = [];
		for(var i=0; i<sheetElArr.length; i++) {
			var sheetEl = sheetElArr[i];
			var name = sheetEl.getAttribute("name");
			sheetNames.push(name);
		}
		return sheetNames;
	};
	t.getVersion = function() {
		return "0.0.1";
	};
	t.getNumberOfSheets = function() {
		return sheetElArr.length;
	};
	t.findCellByName = wrap(function*(name) {
		name = name.trim();
		var nameArr = name.split("!");
		var sheet = yield t.getSheet(nameArr[0]);
		var cell = sheet.findCell(name);
		return cell;
	});

};
exports.getWorkbook = wrap(function*(buf) {
	var hzip = new Hzip(buf);
	var wkEny = hzip.getEntry("xl/workbook.xml");
	var wkBuf = yield inflateRawAysnc(wkEny.cfile);
	var wkDoc = new DOMParser().parseFromString(wkBuf.toString(),'text/xml');
	var sharedStringsArr = [];
	var sharedStringsEny = hzip.getEntry("xl/sharedStrings.xml");
	if(sharedStringsEny) {
		var sharedStringsBuf = yield inflateRawAysnc(sharedStringsEny.cfile);
		var sharedStringsDoc = new DOMParser().parseFromString(sharedStringsBuf.toString(),'text/xml');
		var sstEl = sharedStringsDoc.documentElement;
		var siArr = sstEl.getElementsByTagName("si");
		for(var i=0; i<siArr.length; i++) {
			var siEl = siArr[i];
			var siStr = "";
			var tElArr = siEl.getElementsByTagName("t");
			for(var k=0; k<tElArr.length; k++) {
				var tEl = tElArr[k];
				var tStr = tEl.textContent;
				siStr += tStr;
			}
			sharedStringsArr.push(siStr);
		}
	}
	var relsObj = {};
    var relsEny = hzip.getEntry("xl/_rels/workbook.xml.rels");
    if (relsEny) {
		var relsBuf = yield inflateRawAysnc(relsEny.cfile);
		var relsDoc = new DOMParser().parseFromString(relsBuf.toString(), 'text/xml');
		var relsEl = relsDoc.documentElement;
		var relArr = relsEl.getElementsByTagName("Relationship");
		for(var i=0; i<relArr.length; i++) {
			var relEl = relArr[i];
			var relId = relEl.getAttribute("Id");
			var relType = relEl.getAttribute("Type");
			var relTarget = relEl.getAttribute("Target");
			if (relType === "http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet") {
				relsObj[relId] = relTarget;
			}
		}
	}
	var workbook = new Workbook(wkDoc,sharedStringsArr,relsObj,hzip);
	return workbook;
});
exports.ArrayList = function() {
    this.arr = [],
        this.size = function () {
            return this.arr.length;
        },
        this.add = function () {
            if (arguments.length == 1) {
                this.arr.push(arguments[0]);
            } else if (arguments.length >= 2) {
                var deleteItem = this.arr[arguments[0]];
                this.arr.splice(arguments[0], 1, arguments[1], deleteItem)
            }
            return this;
        },
        this.get = function (index) {
            return this.arr[index];
        },
		this.removeIndex = function (index) {
            this.arr.splice(index, 1);
        },
        this.removeObj = function (obj) {
            this.removeIndex(this.indexOf(obj));
        },
        this.indexOf = function (obj) {
            for (var i = 0; i < this.arr.length; i++) {
            	if (this.arr[i] === obj) {
                    return i;
                };
            }
            return -1;
        },
        this.isEmpty = function () {
            return this.arr.length == 0;
        },
        this.clear = function () {
            this.arr = [];
        },
		this.contains = function (obj) {
            return this.indexOf(obj) != -1;
        }
};

