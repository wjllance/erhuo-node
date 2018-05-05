require('should');
let _ = require('lodash');
let utils = require('utility');
let superagent = require('superagent');
let config = require('../config');
let { log } = require('../config');
let { User } = require('../models');
let { Goods, Comment } = require('../models');
let {Message}=require('../models')
let tools = require("./tools")

let log4js = require('log4js');
let logger = log4js.getLogger('errorLogger');
