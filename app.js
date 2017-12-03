"use strict";
const Koa = require('koa');
const sha1 = require('sha1');
const wechat = require('./wechat/g');
const config = require('./config');
const weixin = require('./weixin');

let app = new Koa();

app.use(wechat(config.wechat,weixin.reply));

app.listen(3006);
console.log('listening 3006');