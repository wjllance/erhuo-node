define({ "api": [
  {
    "type": "post",
    "url": "/bargain",
    "title": "发起砍价",
    "name": "BargainCreate",
    "group": "Bargain",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "goodsId",
            "description": ""
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "success",
            "description": ""
          },
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "data",
            "description": ""
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "src/controllers/bargain.js",
    "groupTitle": "Bargain"
  },
  {
    "type": "get",
    "url": "/bargain/goods/:goods_id",
    "title": "砍价商品详情",
    "name": "BargainGoods",
    "group": "Bargain",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "bargainId",
            "description": ""
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "success",
            "description": ""
          },
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "data",
            "description": ""
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "src/controllers/bargain.js",
    "groupTitle": "Bargain"
  },
  {
    "type": "post",
    "url": "/bargain/join",
    "title": "参与砍价  NO USE!!!",
    "name": "BargainJoin",
    "group": "Bargain",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "bargainId",
            "description": ""
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "success",
            "description": ""
          },
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "data",
            "description": ""
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "src/controllers/bargain.js",
    "groupTitle": "Bargain"
  },
  {
    "name": "_________",
    "type": "",
    "url": "",
    "version": "0.0.0",
    "filename": "src/controllers/wechat.js",
    "group": "C__Users_asd75_Desktop_erhuo_node_zhitu_src_controllers_wechat_js",
    "groupTitle": "C__Users_asd75_Desktop_erhuo_node_zhitu_src_controllers_wechat_js"
  },
  {
    "name": "___________",
    "type": "",
    "url": "",
    "version": "0.0.0",
    "filename": "src/controllers/wechat.js",
    "group": "C__Users_asd75_Desktop_erhuo_node_zhitu_src_controllers_wechat_js",
    "groupTitle": "C__Users_asd75_Desktop_erhuo_node_zhitu_src_controllers_wechat_js"
  },
  {
    "name": "___________",
    "type": "",
    "url": "",
    "version": "0.0.0",
    "filename": "src/controllers/wechat.js",
    "group": "C__Users_asd75_Desktop_erhuo_node_zhitu_src_controllers_wechat_js",
    "groupTitle": "C__Users_asd75_Desktop_erhuo_node_zhitu_src_controllers_wechat_js"
  },
  {
    "type": "get",
    "url": "/center/collections",
    "title": "我的收藏",
    "name": "Collections",
    "group": "Center",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "pageNo",
            "description": "<p>当前页码，默认1</p>"
          },
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "pageSize",
            "description": "<p>每页大小，默认6</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "success",
            "description": "<p>1success</p>"
          },
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "data",
            "description": "<p>列表</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "src/controllers/center.js",
    "groupTitle": "Center"
  },
  {
    "type": "get",
    "url": "/center/moments",
    "title": "留言动态",
    "name": "Moments",
    "group": "Center",
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "success",
            "description": "<p>1success</p>"
          },
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "data",
            "description": "<p>列表</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "src/controllers/center.js",
    "groupTitle": "Center"
  },
  {
    "type": "get",
    "url": "/center/unread",
    "title": "我的未读消息",
    "name": "Unread",
    "group": "Center",
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "success",
            "description": "<p>1success</p>"
          },
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "data",
            "description": "<p>列表</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "src/controllers/center.js",
    "groupTitle": "Center"
  },
  {
    "type": "post",
    "url": "/comment/:goods_id",
    "title": "商品评论",
    "name": "CommentPost",
    "group": "Comment",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "comment",
            "description": "<p>评论内容</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": true,
            "field": "to",
            "description": "<p>被回复人ID</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "success",
            "description": "<p>1success</p>"
          },
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "data",
            "description": "<p>商品详情</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "src/controllers/comment.js",
    "groupTitle": "Comment"
  },
  {
    "type": "post",
    "url": "/follow/on",
    "title": "关注",
    "name": "Follow",
    "group": "Follow",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "toId",
            "description": "<p>被关注用户id</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "src/controllers/follow.js",
    "groupTitle": "Follow"
  },
  {
    "type": "get",
    "url": "/follow/follower",
    "title": "关注他的",
    "name": "FollowerList",
    "group": "Follow",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "pageNo",
            "description": "<p>当前页码，默认1</p>"
          },
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "pageSize",
            "description": "<p>每页大小，默认6</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": true,
            "field": "user_id",
            "description": "<p>用户id</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "success",
            "description": "<p>1success</p>"
          },
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "data",
            "description": "<p>列表</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "src/controllers/follow.js",
    "groupTitle": "Follow"
  },
  {
    "type": "post",
    "url": "/follow/off",
    "title": "取消关注",
    "name": "Unfollow",
    "group": "Follow",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "toId",
            "description": "<p>被取消用户id</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "src/controllers/follow.js",
    "groupTitle": "Follow"
  },
  {
    "type": "get",
    "url": "/follow/concerned",
    "title": "他关注的",
    "name": "concernedList",
    "group": "Follow",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "pageNo",
            "description": "<p>当前页码，默认1</p>"
          },
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "pageSize",
            "description": "<p>每页大小，默认6</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": true,
            "field": "user_id",
            "description": "<p>用户id</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "success",
            "description": "<p>1success</p>"
          },
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "data",
            "description": "<p>列表</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "src/controllers/follow.js",
    "groupTitle": "Follow"
  },
  {
    "type": "get",
    "url": "/goods/base/:goods_id",
    "title": "获取商品基本信息",
    "name": "GetGoodsBaseInfo",
    "group": "Goods",
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "success",
            "description": ""
          },
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "data",
            "description": ""
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "src/controllers/goods.js",
    "groupTitle": "Goods"
  },
  {
    "type": "get",
    "url": "/goods/detail/:goods_id",
    "title": "获取商品详情",
    "name": "GetGoodsDetail",
    "group": "Goods",
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "success",
            "description": ""
          },
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "data",
            "description": ""
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "src/controllers/goods.js",
    "groupTitle": "Goods"
  },
  {
    "type": "delete",
    "url": "/goods/:goods_id",
    "title": "商品删除",
    "name": "GoodsDelete",
    "group": "Goods",
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "success",
            "description": ""
          },
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "data",
            "description": ""
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "src/controllers/goods.js",
    "groupTitle": "Goods"
  },
  {
    "type": "post",
    "url": "/goods/remove/:goods_id",
    "title": "商品下架",
    "name": "GoodsDelete",
    "group": "Goods",
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "success",
            "description": ""
          },
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "data",
            "description": ""
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "src/controllers/goods.js",
    "groupTitle": "Goods"
  },
  {
    "type": "put",
    "url": "/goods/:goods_id",
    "title": "编辑商品",
    "name": "GoodsEdit",
    "group": "Goods",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "gname",
            "description": ""
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "gsummary",
            "description": ""
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "glabel",
            "description": ""
          },
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "gprice",
            "description": ""
          },
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "gcost",
            "description": ""
          },
          {
            "group": "Parameter",
            "type": "Array",
            "optional": false,
            "field": "gpics",
            "description": "<p>图片id列表</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "success",
            "description": ""
          },
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "data",
            "description": ""
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "src/controllers/goods.js",
    "groupTitle": "Goods"
  },
  {
    "type": "get",
    "url": "/goods/hot_words",
    "title": "热搜词",
    "name": "GoodsHotWords",
    "group": "Goods",
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "success",
            "description": "<p>1success</p>"
          },
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "data",
            "description": "<p>分页商品列表</p>"
          },
          {
            "group": "Success 200",
            "type": "Array",
            "optional": false,
            "field": "data.goods",
            "description": "<p>商品列表</p>"
          },
          {
            "group": "Success 200",
            "type": "Boolean",
            "optional": false,
            "field": "data.hasMore",
            "description": "<p>还有更多</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "data.total",
            "description": "<p>总数</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "src/controllers/goods.js",
    "groupTitle": "Goods"
  },
  {
    "type": "get",
    "url": "/v2/goods/index",
    "title": "商品列表",
    "name": "GoodsList",
    "group": "Goods",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "pageNo",
            "description": "<p>当前页码，默认1</p>"
          },
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "pageSize",
            "description": "<p>每页大小，默认6</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "category",
            "description": "<p>列表类别 [&quot;美妆&quot;,&quot;女装&quot;,&quot;女鞋&quot;,&quot;配饰&quot;,&quot;包包&quot;,&quot;日用&quot;,&quot;其他&quot;]</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "success",
            "description": "<p>1success</p>"
          },
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "data",
            "description": "<p>分页商品列表</p>"
          },
          {
            "group": "Success 200",
            "type": "Array",
            "optional": false,
            "field": "data.goods",
            "description": "<p>商品列表</p>"
          },
          {
            "group": "Success 200",
            "type": "Boolean",
            "optional": false,
            "field": "data.hasMore",
            "description": "<p>还有更多</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "data.total",
            "description": "<p>总数</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "src/controllers/goods.js",
    "groupTitle": "Goods"
  },
  {
    "type": "get",
    "url": "/goods/index",
    "title": "商品列表",
    "name": "GoodsList",
    "group": "Goods",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "pageNo",
            "description": "<p>当前页码，默认1</p>"
          },
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "pageSize",
            "description": "<p>每页大小，默认6</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "success",
            "description": "<p>1success</p>"
          },
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "data",
            "description": "<p>分页商品列表</p>"
          },
          {
            "group": "Success 200",
            "type": "Array",
            "optional": false,
            "field": "data.goods",
            "description": "<p>商品列表</p>"
          },
          {
            "group": "Success 200",
            "type": "Boolean",
            "optional": false,
            "field": "data.hasMore",
            "description": "<p>还有更多</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "data.total",
            "description": "<p>总数</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "src/controllers/goods.js",
    "groupTitle": "Goods"
  },
  {
    "type": "post",
    "url": "/v2/goods/publish",
    "title": "发布商品",
    "name": "GoodsPublish",
    "group": "Goods",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Array",
            "optional": true,
            "field": "gpics",
            "description": "<p>图片id列表</p>"
          },
          {
            "group": "Parameter",
            "type": "Array",
            "optional": false,
            "field": "npics",
            "description": "<p>图片id列表</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "gname",
            "description": ""
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "gsummary",
            "description": ""
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "glabel",
            "description": ""
          },
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "gprice",
            "description": ""
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "gstype",
            "description": ""
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "glocation",
            "description": ""
          },
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "gcost",
            "description": ""
          },
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "gcity",
            "description": ""
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "category",
            "description": ""
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "success",
            "description": "<p>1success</p>"
          },
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "data",
            "description": "<p>goods_id</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "src/controllers/goods.js",
    "groupTitle": "Goods"
  },
  {
    "type": "get",
    "url": "/goods/search",
    "title": "商品搜索",
    "name": "GoodsSearch",
    "group": "Goods",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "pageNo",
            "description": "<p>当前页码，默认1</p>"
          },
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "pageSize",
            "description": "<p>每页大小，默认6</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "keyword",
            "description": "<p>关键词</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "success",
            "description": "<p>1success</p>"
          },
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "data",
            "description": "<p>分页商品列表</p>"
          },
          {
            "group": "Success 200",
            "type": "Array",
            "optional": false,
            "field": "data.goods",
            "description": "<p>商品列表</p>"
          },
          {
            "group": "Success 200",
            "type": "Boolean",
            "optional": false,
            "field": "data.hasMore",
            "description": "<p>还有更多</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "data.total",
            "description": "<p>总数</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "src/controllers/goods.js",
    "groupTitle": "Goods"
  },
  {
    "type": "post",
    "url": "/group/check_in",
    "title": "签到",
    "name": "GroupCheckIn",
    "group": "Group",
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "success",
            "description": ""
          },
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "data",
            "description": ""
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "src/controllers/wxgroup.js",
    "groupTitle": "Group"
  },
  {
    "type": "get",
    "url": "/group/:groupId/feed",
    "title": "群商品",
    "name": "GroupFeed",
    "group": "Group",
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "success",
            "description": ""
          },
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "data",
            "description": ""
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "src/controllers/wxgroup.js",
    "groupTitle": "Group"
  },
  {
    "type": "get",
    "url": "/group/:groupId/info",
    "title": "群信息",
    "name": "GroupInfo",
    "group": "Group",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Boolean",
            "optional": true,
            "field": "withMembers",
            "description": ""
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "success",
            "description": ""
          },
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "data",
            "description": ""
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "src/controllers/wxgroup.js",
    "groupTitle": "Group"
  },
  {
    "type": "post",
    "url": "/group/:groupId/join",
    "title": "加入群",
    "name": "GroupJoin",
    "group": "Group",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "invited_by",
            "description": ""
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "success",
            "description": ""
          },
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "data",
            "description": ""
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "src/controllers/wxgroup.js",
    "groupTitle": "Group"
  },
  {
    "type": "post",
    "url": "/group/join",
    "title": "加入群",
    "name": "GroupJoin",
    "group": "Group",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "groupId",
            "description": ""
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "invited_by",
            "description": ""
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": true,
            "field": "userId",
            "description": ""
          },
          {
            "group": "Parameter",
            "type": "Boolean",
            "optional": true,
            "field": "GOD",
            "description": ""
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "success",
            "description": ""
          },
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "data",
            "description": ""
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "src/controllers/wxgroup.js",
    "groupTitle": "Group"
  },
  {
    "type": "get",
    "url": "/group/:groupId/members",
    "title": "全部群成员",
    "name": "GroupMembers",
    "group": "Group",
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "success",
            "description": ""
          },
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "data",
            "description": ""
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "src/controllers/wxgroup.js",
    "groupTitle": "Group"
  },
  {
    "type": "get",
    "url": "/group/:groupId/my_check_ins",
    "title": "我的签到",
    "name": "GroupMyCheckIn",
    "group": "Group",
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "success",
            "description": ""
          },
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "data",
            "description": ""
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "src/controllers/wxgroup.js",
    "groupTitle": "Group"
  },
  {
    "type": "post",
    "url": "/group/:groupId/quit",
    "title": "退出",
    "name": "GroupQuit",
    "group": "Group",
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "success",
            "description": ""
          },
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "data",
            "description": ""
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "src/controllers/wxgroup.js",
    "groupTitle": "Group"
  },
  {
    "type": "post",
    "url": "/group/:groupId/remove_member",
    "title": "移除群成员",
    "name": "GroupRemoveMember",
    "group": "Group",
    "permission": [
      {
        "name": "group_admin"
      }
    ],
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "user_id",
            "description": "<p>被移除的用户ID</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "success",
            "description": ""
          },
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "data",
            "description": ""
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "src/controllers/wxgroup.js",
    "groupTitle": "Group"
  },
  {
    "type": "get",
    "url": "/group/:groupId/bonus",
    "title": "今日福利",
    "name": "GroupTodayBonus",
    "group": "Group",
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "success",
            "description": ""
          },
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "data",
            "description": ""
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "src/controllers/wxgroup.js",
    "groupTitle": "Group"
  },
  {
    "type": "get",
    "url": "/group/:groupId/check_in_members",
    "title": "今日签到",
    "name": "GroupTodayCheckIn",
    "group": "Group",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Number",
            "optional": true,
            "field": "limitCount",
            "description": "<p>前多少个</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "success",
            "description": ""
          },
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "data",
            "description": ""
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "src/controllers/wxgroup.js",
    "groupTitle": "Group"
  },
  {
    "type": "post",
    "url": "/group/update",
    "title": "群信息更新",
    "name": "GroupUpdate",
    "group": "Group",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "encryptedData",
            "description": "<p>加密信息</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "iv",
            "description": ""
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": true,
            "field": "join",
            "description": "<p>是否入群</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "success",
            "description": ""
          },
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "data",
            "description": ""
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "src/controllers/wxgroup.js",
    "groupTitle": "Group"
  },
  {
    "type": "get",
    "url": "/group/my",
    "title": "我的群列表",
    "name": "MyGroupList",
    "group": "Group",
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "success",
            "description": ""
          },
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "data",
            "description": ""
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "src/controllers/wxgroup.js",
    "groupTitle": "Group"
  },
  {
    "type": "get",
    "url": "/order/sell/",
    "title": "我卖出的",
    "name": "GetOrderBuy",
    "group": "Order",
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "success",
            "description": ""
          },
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "data",
            "description": ""
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "src/controllers/order.js",
    "groupTitle": "Order"
  },
  {
    "type": "get",
    "url": "/order/buy/",
    "title": "我买到的",
    "name": "GetOrderBuy",
    "group": "Order",
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "success",
            "description": ""
          },
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "data",
            "description": ""
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "src/controllers/order.js",
    "groupTitle": "Order"
  },
  {
    "type": "post",
    "url": "/order/complete/",
    "title": "买家确认收货",
    "name": "OrderComplete",
    "group": "Order",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "orderId",
            "description": ""
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "success",
            "description": ""
          },
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "data",
            "description": ""
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "src/controllers/order.js",
    "groupTitle": "Order"
  },
  {
    "type": "post",
    "url": "/order/cancel/",
    "title": "取消订单",
    "name": "OrderConcel",
    "group": "Order",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "orderId",
            "description": ""
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "success",
            "description": ""
          },
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "data",
            "description": ""
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "src/controllers/order.js",
    "groupTitle": "Order"
  },
  {
    "type": "post",
    "url": "/order/confirm/",
    "title": "卖家发货（确认订单）",
    "name": "OrderConfirm",
    "group": "Order",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "orderId",
            "description": ""
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "success",
            "description": ""
          },
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "data",
            "description": ""
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "src/controllers/order.js",
    "groupTitle": "Order"
  },
  {
    "type": "post",
    "url": "/order/",
    "title": "下单",
    "name": "OrderCreate",
    "group": "Order",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "goodsId",
            "description": ""
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "success",
            "description": ""
          },
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "data",
            "description": ""
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "src/controllers/order.js",
    "groupTitle": "Order"
  },
  {
    "type": "post",
    "url": "/order/create_pay/",
    "title": "下单并支付",
    "name": "OrderCreateAndPay",
    "group": "Order",
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "success",
            "description": ""
          },
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "data",
            "description": ""
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "src/controllers/order.js",
    "groupTitle": "Order"
  },
  {
    "type": "get",
    "url": "/order/detail/:order_id",
    "title": "订单详情",
    "name": "OrderDetail",
    "group": "Order",
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "success",
            "description": ""
          },
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "data",
            "description": ""
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "src/controllers/order.js",
    "groupTitle": "Order"
  },
  {
    "type": "patch",
    "url": "/order/:orderId",
    "title": "修改订单",
    "name": "OrderPatch",
    "group": "Order",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "price",
            "description": "<p>暂只支持修改价格 买卖家都可修改</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "success",
            "description": ""
          },
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "data",
            "description": ""
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "src/controllers/order.js",
    "groupTitle": "Order"
  },
  {
    "type": "get",
    "url": "/order/pay/:orderId",
    "title": "获取支付参数",
    "name": "OrderPay",
    "group": "Order",
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "success",
            "description": ""
          },
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "data",
            "description": ""
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "src/controllers/order.js",
    "groupTitle": "Order"
  },
  {
    "type": "post",
    "url": "/order/refund/apply",
    "title": "申请退款",
    "name": "RefundApply",
    "group": "Order",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "orderId",
            "description": ""
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "success",
            "description": ""
          },
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "data",
            "description": ""
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "src/controllers/order.js",
    "groupTitle": "Order"
  },
  {
    "type": "post",
    "url": "/order/refund/confirm",
    "title": "确认退款",
    "name": "RefundConfirm",
    "group": "Order",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "orderId",
            "description": ""
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "success",
            "description": ""
          },
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "data",
            "description": ""
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "src/controllers/order.js",
    "groupTitle": "Order"
  },
  {
    "type": "post",
    "url": "/transaction/withdraw/",
    "title": "提现",
    "name": "TransactionWithdraw",
    "group": "Transaction",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "amount",
            "description": "<p>数量，最多两位小数</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "success",
            "description": ""
          },
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "data",
            "description": ""
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "src/controllers/transaction.js",
    "groupTitle": "Transaction"
  },
  {
    "type": "post",
    "url": "/location/Groom",
    "title": "定位推荐",
    "name": "UniversityList",
    "group": "University",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "longitude",
            "description": "<p>经度</p>"
          },
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "latitude",
            "description": "<p>纬度</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "name",
            "description": "<p>api返回的地址信息</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "cityName",
            "description": "<p>取出的市名</p>"
          },
          {
            "group": "Success 200",
            "type": "Object[]",
            "optional": false,
            "field": "resultSet",
            "description": "<p>推荐的学校列表</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "src/controllers/university.js",
    "groupTitle": "University"
  },
  {
    "type": "post",
    "url": "/user/collect/:goods_id",
    "title": "收藏",
    "name": "Collect",
    "group": "User",
    "version": "0.0.0",
    "filename": "src/controllers/comment.js",
    "groupTitle": "User"
  },
  {
    "type": "get",
    "url": "/user/collections",
    "title": "我的收藏",
    "name": "Collections",
    "group": "User",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "pageNo",
            "description": "<p>当前页码，默认1</p>"
          },
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "pageSize",
            "description": "<p>每页大小，默认6</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "success",
            "description": "<p>1success</p>"
          },
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "data",
            "description": "<p>列表</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "src/controllers/user.js",
    "groupTitle": "User"
  },
  {
    "type": "post",
    "url": "/user/like",
    "title": "点赞",
    "name": "Like",
    "group": "User",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "goodsId",
            "description": ""
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "src/controllers/comment.js",
    "groupTitle": "User"
  },
  {
    "type": "post",
    "url": "/user/login",
    "title": "用户登录",
    "name": "Login",
    "group": "User",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "code",
            "description": "<p>微信登录code</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "success",
            "description": "<p>1success</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "src/controllers/user.js",
    "groupTitle": "User"
  },
  {
    "type": "get",
    "url": "/user/mylikes",
    "title": "我的点赞",
    "name": "MyLikes",
    "group": "User",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "pageNo",
            "description": "<p>当前页码，默认1</p>"
          },
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "pageSize",
            "description": "<p>每页大小，默认6</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "success",
            "description": "<p>1success</p>"
          },
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "data",
            "description": "<p>列表</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "src/controllers/user.js",
    "groupTitle": "User"
  },
  {
    "type": "get",
    "url": "/user/mypublish",
    "title": "我的发布",
    "name": "MyPublish",
    "group": "User",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Number",
            "optional": true,
            "field": "isRemoved",
            "description": "<p>是否下架</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "src/controllers/user.js",
    "groupTitle": "User"
  },
  {
    "type": "post",
    "url": "/user/save_formids/",
    "title": "上传formid",
    "name": "SaveFormIds",
    "group": "User",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Object",
            "optional": false,
            "field": "formIds",
            "description": "<p>formIds:{key:expire_time}</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "src/controllers/user.js",
    "groupTitle": "User"
  },
  {
    "type": "post",
    "url": "/user/uncollect/:goods_id",
    "title": "取消收藏",
    "name": "Uncollect",
    "group": "User",
    "version": "0.0.0",
    "filename": "src/controllers/comment.js",
    "groupTitle": "User"
  },
  {
    "type": "post",
    "url": "/user/unlike",
    "title": "取消点赞",
    "name": "Unlike",
    "group": "User",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "goodsId",
            "description": ""
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "src/controllers/comment.js",
    "groupTitle": "User"
  },
  {
    "type": "post",
    "url": "/user/update",
    "title": "用户更新",
    "name": "Update",
    "group": "User",
    "version": "0.0.0",
    "filename": "src/controllers/user.js",
    "groupTitle": "User"
  },
  {
    "type": "post",
    "url": "/user/update_mina",
    "title": "小程序内用户更新",
    "name": "UpdateMina",
    "group": "User",
    "version": "0.0.0",
    "filename": "src/controllers/user.js",
    "groupTitle": "User"
  },
  {
    "type": "get",
    "url": "/user/:user_id/publish_list",
    "title": "发布列表",
    "name": "UserPublish",
    "group": "User",
    "version": "0.0.0",
    "filename": "src/controllers/user.js",
    "groupTitle": "User"
  },
  {
    "type": "post",
    "url": "/identity/save",
    "title": "上传认证资料",
    "name": "__",
    "group": "identity",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "ncard",
            "description": "<p>学生证图片id</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "nwithcard",
            "description": "<p>手持身份证图片id</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "name",
            "description": "<p>姓名</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "studentID",
            "description": "<p>学号</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "school",
            "description": "<p>学校</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "success",
            "description": "<p>1success</p>"
          },
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "data",
            "description": "<p>分页商品列表</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "src/controllers/identity.js",
    "groupTitle": "identity"
  },
  {
    "type": "post",
    "url": "/zhaopin/save",
    "title": "应聘申请",
    "name": "zhaopinsave",
    "group": "zhaopin",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "name",
            "description": "<p>学生姓名</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "tel",
            "description": "<p>电话号码</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "school",
            "description": "<p>所属学校</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "grade",
            "description": "<p>年级</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "profession",
            "description": "<p>专业</p>"
          },
          {
            "group": "Parameter",
            "type": "Number",
            "optional": true,
            "field": "IsDurable",
            "description": "<p>是否坐班</p>"
          },
          {
            "group": "Parameter",
            "type": "Number",
            "optional": true,
            "field": "IsUnderstand",
            "description": "<p>是否需要深入了解</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "zhaopin._id",
            "description": "<p>创建的id</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "src/controllers/zhaopin.js",
    "groupTitle": "zhaopin"
  }
] });
