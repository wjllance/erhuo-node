
正确返回的统一格式：

```json
{
    "success" : 1,
    "data" : any // the data
}
```

错误返回的统一格式：

```json
{
    "err" : 1,
    "msg" : string
}
```

# 依赖

* node >= 8.3.0
* mongo

# 安装

### 安装Node 8.3.0

1. CentOS

```sh
> sudo yum install npm
> sudo npm install n -g
> sudo n 8.3.0
```

2. Ubuntu

```sh
> sudo apt install npm
> sudo npm install n -g
> sudo n 8.3.0
```

3. Windows

去[https://nodejs.org](https://nodejs.org)下载安装包安装，把可执行文件的路径加入Path。

### 安装Mongo

视环境不同，找不同的教程。

### 安装项目依赖

在项目目录中执行

```sh
> npm install
```

# 运行

先将`config.default.yml`更名为`config.yml`，根据需要修改其中的内容。

```sh
> node src/app.js
```

然后用浏览器打开[http://localhost:8000/ping](http://localhost:8000/ping)，如果收到`{"data":"pong"}`则表示启动成功。

```

服务器代码更新
c2c/Jicunbao2017
日志目录:
ROOT_PATH/logs/error/   错误日志
ROOT_PATH/logs/response/    访问日志
【线上】~/erhuo
重启app
>pm2 restart app
查看服务器的输出
>pm2 logs app
【测试】~/dev/erhuo
重启app
>pm2 restart dev
查看服务器的输出
>pm2 logs dev