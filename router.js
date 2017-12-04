"use strict"

const Wechat = require('./wechat/wechat');

function *apifn(next){
    console.log('========',this.host);
    console.log('xxxxx',this);
    console.log('00000dddddd',this.path,this.request);
    this.body = {
        "status": 0,
        "msg": "sssssss"
    };
    let clientUrl = "https://js.zeroyh.cn" + this.path;
    wechatApi.getJsApiData(clientUrl).then(data => {
        console.log('======= auth ===== ',data);
        that.body = {
            signature: data[0],
            timestamp: data[1],
            nonceStr: data[2],
            appId: opts.appId
        };
    });
}

module.exports = {
    api:apifn
}