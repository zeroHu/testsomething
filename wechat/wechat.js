"use strict";

const Promise = require('bluebird');
const util = require('./util');
const request = Promise.promisify(require('request'));

let prefix = 'https://api.weixin.qq.com/cgi-bin/';
let api = {
    accessToken: prefix + 'token?grant_type=client_credential'
}

function Wechat(opts){
    const that = this;
    this.appID = opts.appID;
    this.AppSecret = opts.AppSecret;
    this.getAccessToken = opts.getAccessToken;
    this.saveAccessToken = opts.saveAccessToken;

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
        })
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


Wechat.prototype.replay = function(){
    // 拿到回复的内容
    let content = this.body;
    let message = this.weixin;


    console.log('=======replay content val',content,'message',message);
    let xml = util.tpl(content,message);

    this.status = 200;
    this.type = 'application/xml';
    this.body = xml;

}

module.exports = Wechat;

