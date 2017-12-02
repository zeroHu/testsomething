"use strict";
const sha1 = require('sha1');
const Promise = require('bluebird');
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
            try{
                data = JSON.parse(data);
            }catch(e){
                return that.updateAccessToken(data);
            }
            if(that.isValidAccessToken(data)){
                Promise.resolve(data);
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
            var data = response.body && JSON.parse(response.body);
            var now = (new Date().getTime());
            var expires_in = now + (data.expires_in - 20) * 1000;

            data.expires_in = expires_in;
            resolve(data);
        })
    });
}



module.exports = function(opts){
    return function *(next){
        var wechat = new Wechat(opts);
        /**
         * this.query
        {
            signature: 'aab3e0841de150695f756508d215eed1da1a9013',
            echostr: '1089649851872509669',
            timestamp: '1512204961',
            nonce: '65417124'
        }
         */
        var token = opts.token;
        var signature = this.query.signature;
        var nonce = this.query.nonce;
        var timestamp = this.query.timestamp;
        var echostr = this.query.echostr;
        var str = [token,timestamp,nonce].sort().join("");
        var sha = sha1(str);
        if(sha === signature){
            this.body = echostr+'';
        }else{
            this.body = 'wrong';
        }
    }
}