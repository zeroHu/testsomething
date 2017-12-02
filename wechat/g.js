"use strict";
const sha1 = require('sha1');
const getRawBody = require('raw-body');
const util = require('./util');
const Wechat = require('./wechat');

module.exports = function(opts){
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
        let token = opts.token;
        let signature = this.query.signature;
        let nonce = this.query.nonce;
        let timestamp = this.query.timestamp;
        let echostr = this.query.echostr;
        let str = [token,timestamp,nonce].sort().join("");
        let sha = sha1(str);

        if(this.method === 'GET'){
            if(sha === signature){
                this.body = echostr+'';
            }else{
                this.body = 'wrong';
            }
        }else if(this.method === 'POST'){
            if(sha !== signature){
                this.body = 'wrong';
                return false;
            }
            let data = yield getRawBody(this.req,{
                length:this.length,
                limit:'1mb',
                encoding:this.charset
            });
            console.log('post xml is --->',data.toString());
            let content = yield util.parseXMLAsync(data);

            console.log('post content is',content.toString());
            
            let message = util.formatMessage(context.xml);
            console.log('message content is',message.toString());
        }
    }
}