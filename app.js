"use strict";
const Koa = require('koa');
const Krouter = require('koa-route');
const sha1 = require('sha1');
const wechat = require('./wechat/g');
const config = require('./config');
const weixin = require('./weixin');

let app = new Koa();

// 定义路由
const auth = require('./router').auth;

// 引用中间件
app.use(wechat(config.wechat,weixin.reply));

console.log('-----start router ------');
// 路由
app.use(Krouter.get('/auth', auth));

app.listen(3006);
console.log('listening 3006');