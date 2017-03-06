'use strict';

var Auth = require('./auth');
var qs = require('querystring');
var crypto = require('crypto');
var fetch = require('node-fetch');

/**
 * 构造方法
 * @param accessKey
 * @param secretKey
 * @constructor
 */
function BaiduSMS(accessKey, secretKey) {
    this._accessKey = accessKey;
    this._secretKey = secretKey;
    this._endPoint = 'sms.bj.baidubce.com';
}

BaiduSMS.prototype.getContentType = function () {
    return 'application/json;charset=utf-8';
};

BaiduSMS.prototype.setEndPoint = function (endPoint) {
    this._endPoint = endPoint;
};

BaiduSMS.prototype.getEndPoint = function () {
    return this._endPoint;
};

/**
 * 生成请求头
 *
 * @param params
 */
BaiduSMS.prototype.generateHeaders = function (method, resource, params) {
    var now = new Date();
    var body = qs.stringify(params);
    var headers = {
        'Host': this._endPoint,
        'Content-Type': this.getContentType(),
        'Content-Length': body.length,
        'x-bce-date': now
    };
    if (method === 'POST' || method === 'PUT') {
        var sha256 = crypto.createHash('sha256');
        headers['x-bce-content-sha256'] = sha256.update(body).digest('hex');
    }
    var auth = new Auth(this._accessKey, this._secretKey);
    headers.Authorization = auth.generateAuthorization(method, resource, params, headers, now.getTime() / 1000, 600);
    return headers;
};

/**
 * 请求API
 *
 * @param method   API名称
 * @param apiName   请求URI
 * @param postFields POST数据
 * @return {Promise}
 */
BaiduSMS.prototype.request = function (method, apiName, postFields) {
    var headers = this.generateHeaders(method, apiName, postFields);
    var body = qs.stringify(postFields);
    return fetch('http://' + this._endPoint + apiName, {
        method: method,
        body: body,
        headers: headers
    }).then(function (res) {
        return res.json();
    }).catch(function (e) {
        throw e;
    })
};

/**
 * 短信下发至单个设备
 *
 * @param invokeId  调用ID,短信签名ID
 * @param phone     手机号
 * @param tplCode   短信模板ID
 * @param content   模板变量内容
 * @returns {Promise}
 */
BaiduSMS.prototype.sendSmsSingleDevice = function (invokeId, phone, tplCode, content) {
    var params = {
        "invokeId": invokeId,
        "phoneNumber": phone,
        "templateCode": tplCode,
        "contentVar": content
    };
    return this.request('POST', '/bce/v2/message', params);
};

module.exports = BaiduSMS;