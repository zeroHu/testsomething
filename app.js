"use strict";
const Koa = require('koa');
// const router = require('koa-router')();//router
const sha1 = require('sha1');
const wechat = require('./wechat/g');
const config = require('./config');
const weixin = require('./weixin');

let app = new Koa();

// 定义路由
const RouteFn = require('./router');

// 引用中间件
app.use(wechat(config.wechat,weixin.reply));


// router.post('/auth',RouteFn.auth);

app.listen(3006);
console.log('listening 3006');