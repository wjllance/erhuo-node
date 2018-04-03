
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

* node >= 7.9.0
* mongo

# 安装

### 安装Node 7.9.0

1. CentOS

```sh
> sudo yum install npm
> sudo npm install n -g
> sudo n 7.9.0
```

2. Ubuntu

```sh
> sudo apt install npm
> sudo npm install n -g
> sudo n 7.9.0
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
