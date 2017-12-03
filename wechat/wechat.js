"use strict";

const Promise = require('bluebird');
const util = require('./util');
const fs = require('fs');
const request = Promise.promisify(require('request'));

let prefix = 'https://api.weixin.qq.com/cgi-bin/';
let api = {
    accessToken: prefix + 'token?grant_type=client_credential',
    upload: prefix+'media/upload?'//access_token=ACCESS_TOKEN&type=TYPE
}

function Wechat(opts){
    const that = this;
    this.appID = opts.appID;
    this.AppSecret = opts.AppSecret;
    this.getAccessToken = opts.getAccessToken;
    this.saveAccessToken = opts.saveAccessToken;

    this.fetchAccessToken();
}
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
            console.log('--------fetchAccessToken',data);
            return Promise.resolve(data);
        })
}

Wechat.prototype.uploadMaterial = function(type,filepath){
    const that = this;

    let form = {
        media:fs.createReadStream(filepath)
    }
    let appID = this.appID;
    let AppSecret = this.AppSecret;

    return new Promise(function(resolve,reject){
        that
            .fetchAccessToken()
            .then(function(data){
                console.log('----------uploadMaterial',data);
                let url = api.upload+'access_token='+data.access_token + '&type=' + type;
                return new Promise(function(resolve,reject){
                    request({
                        method:'POST',
                        url:url,
                        formData:form,
                        josn:true
                    }).then(function(response){
                        let _data = response.body && JSON.parse(response.body);
                        if(_data) {
                            console.log('----uploadMaterial request is correct and _data is',_data);
                            resolve(_data);
                        }
                        else {
                            throw new Error('uploadMaterial is wrong ');
                        }
                    }).catch(function(err){
                        reject(err);
                    })
                });
            });
    });
    console.lot('11111111111111');
}


Wechat.prototype.reply = function(){
    // 拿到回复的内容
    let content = this.body;
    let message = this.weixin;


    console.log('=======replay content val',content,'message',message);

    let xml = util.tpl(content,message);

    console.log('----the send end xml is',xml);

    this.status = 200;
    this.type = 'application/xml';
    this.body = xml;
    return;
}

module.exports = Wechat;

