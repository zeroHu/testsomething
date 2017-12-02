"use strict";
const Koa = require('koa');
const sha1 = require('sha1');
const wechat = require('./wechat/g');
const path = require('path');
const util = require('./libs/util');
const wechat_file = path.join(__dirname+'./config/wechat.txt');

let config = {
    wechat : {
        appID : "wx8248ca95a92fef4a",
        AppSecret: "36f20e06c30779db459a6d0d1b24445c",
        token: "thisisjszeroyhcntokenonly",
        // 读取文件
        getAccessToken:function(){
            return util.readFileAsync(wechat_file);
        },
        // 保存文件
        saveAccessToken: function(data){
            data = JSON.stringify(data);
            return util.writeFileAsync(wechat_file,data)
        }
    }
}

let app = new Koa();

// 签名验证的方式
app.use(wechat(config.wechat));

app.listen(3006);
console.log('listening 3006')