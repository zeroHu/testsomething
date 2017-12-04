"use strict";
const sha1 = require('sha1');
const getRawBody = require('raw-body');
const util = require('./util');
const Wechat = require('./wechat');

module.exports = function(opts,handler){
    return function *(next){
        let wechat = new Wechat(opts);
        /**
         * this.query
        {
            signature: 'aab3e0841de150695f756508d215eed1da1a9013',
            echostr: '1089649851872509669',
            timestamp: '1512204961',
            nonce: '65417124'
        }
         */
        let that = this;
        let token = opts.token;
        let signature = this.query.signature;
        let nonce = this.query.nonce;
        let timestamp = this.query.timestamp;
        let echostr = this.query.echostr;
        let str = [token,timestamp,nonce].sort().join("");
        let sha = sha1(str);

        // 如果是 GET 请求
        if(this.method === 'GET'){
            if(sha === signature){
                this.body = echostr+'';
            }else{
                this.body = 'wrong';
            }
        }
        // 如果是 POST 请求
        else if(this.method === 'POST'){
            if(sha !== signature){
                this.body = 'wrong';
                return false;
            }
            // 处理data 格式
            let data = yield getRawBody(this.req,{
                length: this.length,
                limit: '1mb',
                encoding: this.charset
            });

            // content 是指发送过来的data 下面是content 格式
            /*{
                xml:{
                    ToUserName: [ 'gh_4bbce1727be7' ],
                    FromUserName: [ 'oiLtb1hEhRLc3fPCAoMLobL016Tw' ],
                    CreateTime: [ '1512379368' ],
                    MsgType: [ 'text' ],
                    Content: [ '1' ],
                    MsgId: [ '6495619925126148093' ]
                }
            }*/
            let content = yield util.parseXMLAsync(data);

            // 发送过来的 data 下面是 message 也就是content转换后的格式
            /*{
                ToUserName: 'gh_4bbce1727be7',
                FromUserName: 'oiLtb1hEhRLc3fPCAoMLobL016Tw',
                CreateTime: '1512379368',
                MsgType: 'text',
                Content: '1',
                MsgId: '6495619925126148093'
            }*/
            let message = util.formatMessage(content.xml);

            // 赋值 weixin 的值为 message
            this.weixin = message;

            // 执行回复模板消息拼接
            yield handler.call(this,next);

            // 执行回复
            wechat.reply.call(this);
        }
    }
}