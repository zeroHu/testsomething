"use strict"

const Wechat = require('./wechat/wechat');
const config = require('./config');

const wechatApi = new Wechat(config.wechat);

const auth = function(req, res) {
    console.log('------auth function------',req);
    var clientUrl = 'http://' + req.hostname + req.url;
    console.log('------clientUrl------',clientUrl);
    // wechatApi.getJsApiData(clientUrl).then(data => {
    //     console.log('======= auth ===== ',data);
    //     res.json({
    //         signature: data[0],
    //         timestamp: data[1],
    //         nonceStr: data[2],
    //         appId: config.appId
    //     })
    // });
}

// 导出路由
exports = module.exports = {
    auth: auth
}