"use strict";

const Promise = require('bluebird');
const util = require('./util');
const fs = require('fs');
const path = require('path');
const request = Promise.promisify(require('request'));

let prefix = 'https://api.weixin.qq.com/cgi-bin/';
let api = {
    accessToken: prefix + 'token?grant_type=client_credential',
    uploadUrl: prefix+'media/upload?',//access_token=ACCESS_TOKEN&type=TYPE
    menuCreate: prefix + 'menu/create?',//access_token=ACCESS_TOKEN
    menuDelete:prefix+'/menu/delete?'
}

function Wechat(opts){
    const that = this;
    // 获取appid and appsecret
    this.appID = opts.appID;
    this.AppSecret = opts.AppSecret;

    // 读 或者写 accesstoken
    this.getAccessToken = opts.getAccessToken;
    this.saveAccessToken = opts.saveAccessToken;

    // 初始执行获取accesstoken
    this.fetchAccessToken();
}


// 检测accesstoken 是否是有效的
Wechat.prototype.isValidAccessToken = function(data){
    if(!data || !data.access_token || !data.expires_in){
        return false
    }

    let access_token = data.access_token;
    let expires_in = data.expires_in;
    let now = (new Date().getTime());

    if(now < expires_in){
        return true;
    }else{
        return false;
    }
}

// 更新accesstoken
Wechat.prototype.updateAccessToken = function(){
    let appID = this.appID;
    let AppSecret = this.AppSecret;
    let url = api.accessToken+'&appid='+appID + '&secret=' + AppSecret;

    return new Promise(function(resolve,reject){
        request({
            url:url,
            josn:true
        }).then(function(response){
            let data = response.body && JSON.parse(response.body);
            let now = (new Date().getTime());
            let expires_in = now + (data.expires_in - 20) * 1000;

            data.expires_in = expires_in;
            resolve(data);
        })
    });
}

// 获取accesstoken
Wechat.prototype.fetchAccessToken = function(data){
    const that = this;
    // 有效的token
    if(that.access_token && that.expires_in){
        if(this.isValidAccessToken(this)){
            return Promise.resolve(this);
        }
    }
    // 无效的token 获取
    this.getAccessToken()
        .then(function(data){
            // 是否有access_token
            try{
                data = JSON.parse(data);
            }catch(e){
                return that.updateAccessToken(data);
            }
            // 验证成功
            if(that.isValidAccessToken(data)){
                return Promise.resolve(data);
            }else{
                return that.updateAccessToken();
            }
        })
        .then(function(data){
            that.access_token = data.access_token;
            that.expires_in = data.expires_in;

            that.saveAccessToken(data);
            return Promise.resolve(data);
        })
}

// 创建菜单
Wechat.prototype.createMenu = function(menu){
    const that = this;
    return new Promise(function(resolve,reject){
        that.fetchAccessToken().then(function(data){
            var url = api.menuCreate + 'access_token=' + data.access_token;
            request({url:url,method:'POST',body:menu,json:true}).then(function(response){
                /**   个人订阅号无此权限的说明
                *{
                *   errcode: 48001,
                *   errmsg: 'api unauthorized hint: [DzGhYa0960vr64!]'
                * }
                */
                var _data = response.body;
                if(_data.errcode === 0){
                    resolve(_data);
                }else{
                    throw new Error('create menu failed!');
                }
            }).catch(function(err){
                reject(err);
            });
        });
    });
}


// 删除菜单
Wechat.prototype.deleteMenu = function(){
    const that = this;
    return new Promise(function(resolve,reject){
        that.fetchAccessToken().then(function(data){
            let url = api.menuDelete + 'access_token=' + data.access_token;
            request({url:url,json:true}).then(function(response){
                var _data = response.body;
                if(_data.errcode === 0){
                    resolve();
                }else{
                    throw new Error('delete menu failed!');
                }
            }).catch(function(err){
                reject(err);
            });
        });
    });
}


// 上传素材
Wechat.prototype.uploadMaterial = function(type,filepath){
    const that = this;
    let form = { //构造表单
        media:fs.createReadStream(filepath)
    }
    // 上传素材
    return new Promise(function(resolve,reject){
        that.fetchAccessToken().then(function(data){
            let url = api.uploadUrl + 'access_token=' + data.access_token + '&type=' + type;
            request({url:url,method:'POST',formData:form,json:true}).then(function(response){
                let _data = response.body;
                if(_data) {
                    resolve(_data)
                }
                else {
                    throw new Error('uploadMaterial is wrong ');
                }
            }).catch(function(err){
                reject(err);
            });
        });
    });
}

// 回复
Wechat.prototype.reply = function(){
    // 拿到回复的内容
    let content = this.body;
    let message = this.weixin;


    console.log('=======replay content val======',content,'message',message);
    let xml = util.tpl(content,message);

    console.log('----the replay send xml is----',xml);
    this.status = 200;
    this.type = 'application/xml';
    this.body = xml;
    return;
}

module.exports = Wechat;

