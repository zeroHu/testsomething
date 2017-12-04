"use strict";
const Koa = require('koa');
const sha1 = require('sha1');
const wechat = require('./wechat/g');
const config = require('./config');
const weixin = require('./weixin');

let app = new Koa();

// 定义引用的路由方法处理文件
const router = require('./router');

// 引用中间件
// app.use(wechat(config.wechat,weixin.reply));

// 路由管理
// app.use(router(config.wechat));


function *routeapi(next) {
    console.log('=======',this.path);
    if ('/api' == this.path) {
        yield router.api.call(this,config.wechat);
    } else {
        yield next;
    }
};

app.use(routeapi);

app.listen(3006);
console.log('listening 3006');