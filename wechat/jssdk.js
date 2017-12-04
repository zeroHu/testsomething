'use strict';

const fs = require('fs');
const request = require('request');
const qs = require('querystring');
const path = require('path');
const wechat_file = path.join('../config/wechat.txt');
const util = require('../libs/util');
const token = util.readFileAsync(wechat_file) && JSON.parse(util.readFileAsync(wechat_file)).access_token;
const sha1 = require('sha1');

const reqUrl = 'https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=' + token + '&type=jsapi';

// 获取api ticket
function getJsApiTicket() {
    let options = {
        method: 'get',
        url: reqUrl
    };
    return new Promise((resolve, reject) => {
        request(options, function(err, res, body) {
            if (res) {
                resolve(body);
            } else {
                reject(err);
            }
        })
    })
}

//noncestr
function getNonceStr() {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (var i = 0; i < 16; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}

//timestamp
function getTimestamp() {
    return new Date().valueOf();
}

// 获取签名
function getSign(jsApiTicket, noncestr, timestamp, url) {
    let data = {
        'jsapi_ticket': jsApiTicket,
        'noncestr': noncestr,
        'timestamp': timestamp,
        'url': url
    };
    var sortData = "jsapi_ticket=" + jsApiTicket + "&noncestr=" + noncestr + "×tamp=" + timestamp + "&url=" + url;
    console.log('------------sortData------------',sortData);
    return sha1(sortData);
}

//返回数据分别为sign, timestamp, noncestr
function getJsApiData(clientUrl) {
    let noncestr = getNonceStr();
    let timestamp = getTimestamp();
    // 返回结果
    return getJsApiTicket().then(data => {
        return [getSign(JSON.parse(data).ticket, noncestr, timestamp, clientUrl), timestamp, noncestr];
    });
}

// 导出结果
module.exports = {
    getJsApiData: getJsApiData
};