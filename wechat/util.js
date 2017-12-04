"use strict"
const xml2js = require('xml2js');
const tpl = require('./tpl');
const Promise = require('bluebird');

// xml to js处理
const parseXMLAsync = function(xml) {
    return new Promise(function(resolve, reject) {
        xml2js.parseString(xml, { trim: true }, function(err, content) {
            if (err) reject(err)
            else resolve(content)
        });
    });
}

// 格式化 [] 改为 json key ： value  格式 message
const formatMessage = function(result) {
    let message = {};
    if (typeof result === 'object') {
        let keys = Object.keys(result);

        for (let i = 0; i < keys.length; i++) {
            let item = result[keys[i]];
            let key = keys[i];
            if (!(item instanceof Array) || item.length == 0) {
                continue;
            }
            if (item.length === 1) {
                let val = item[0];
                if (typeof val === 'object') {
                    message[key] = formatMessage(val);
                } else {
                    message[key] = (val || '').trim();
                }
            } else {
                message[key] = [];
                for (let j = 0, k = item.length; j < k; j++) {
                    message[key].push(formatMessage(item[j]));
                }
            }
        }
    }
    return message;
}

// 处理模板
const templ = function(content, message) {
    let info = {};
    let type = 'text';
    let toUserName = message.ToUserName;
    let fromUserName = message.FromUserName;

    if (Array.isArray(content)) {
        type = "news";
    }
    type = content.type || type;

    info.content = content;
    info.createTime = new Date().getTime();
    info.msgType = type;
    info.fromUserName = toUserName;
    info.toUserName = fromUserName;

    return tpl.compiled(info);
}


module.exports = {
    parseXMLAsync: parseXMLAsync,
    formatMessage: formatMessage,
    tpl: templ
}