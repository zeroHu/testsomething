"use strict";

const path = require('path');
const wechat_file = path.join('./config/wechat.txt');
const util = require('./libs/util');

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
''
exports = module.exports = config;