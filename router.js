"use strict"

const getJsApiData = require('./wechat/jssdk').getJsApiData;

const auth = function() {
    var clientUrl = 'http://' + req.hostname + req.url;
    getJsApiData(clientUrl).then(data => {
        res.json({
            signature: data[0],
            timestamp: data[1],
            nonceStr: data[2],
            appId: config.appId
        })
    });
}

// 导出路由
exports = module.exports = {
    auth: auth
}