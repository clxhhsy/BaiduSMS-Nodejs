/*
 * 认证机制:
 *  采用Access Key与请求签名机制
 * 
 * 认证字符串格式:
 *  bce-auth-v{version}/{accessKeyId}/{timestamp}/{expirationPeriodInSeconds}/{signedHeaders}/{signature}
 *      timestamp是生成签名时的时间,expirationPeriodInSeconds表示签名有效期限,signedHeaders是签名算法中涉及到的头域列表,signature是256位签名的十六进制表示
 *      
 * 签名算法
 * Hash算法使用HMAC SHA256。
 * 1.生成SigningKey
 *  SigningKey = SHA256-HEX("{secretAccessKey}", "bce-auth-v{version}/{accessKeyId}/{timestamp}/{expirationPeriodInSeconds}")
 *  
 * 2.生成CanonicalRequest
 *  CanonicalRequest = toUpperCase(HTTP Method) + "\n" + CanonicalURI + "\n" + CanonicalQueryString + "\n" + CanonicalHeaders
 *  
 *  2.1 生成CanonicalURI
 *  CanonicalURI = NormalizeExceptSlash(URL Path),也就是说将Path看成是以斜杠（/）分隔的字符串
 *  
 *  2.2 生成CanonicalQueryString
 *  所有参数除了authorization之外都应该被加入到CanonicalQueryString中。
 *  
 *  2.3 生成CanonicalHeaders
 *  必须被签名的头域包括Host
 *  
 * 3.生成最终签名
 *  Signature = SHA256-HEX(SigningKey, CanonicalRequest)
 */

var util = require('util');
var u = require('underscore');
var strings = require('./strings');

var debug = require('debug')('bce-sdk:auth');

/**
 * 构造函数
 *
 * @constructor
 * @param {string} ak.
 * @param {string} sk.
 */
function Auth(ak, sk) {
    this.ak = ak;
    this.sk = sk;
}

/**
 * 生成authorization
 *
 * @param {string} 请求方式
 * @param {string} 请求路径
 * @param {Object=} 参数
 * @param {Object=} 请求头
 * @param {number=} 请求时间
 * @param {number=} 过期时间
 * @param {Array.<string>=} 签名中涉及的请求头信息
 *
 * @return {string} authorization.
 */
Auth.prototype.generateAuthorization = function (method, resource, params,
                                                 headers, timestamp, expirationInSeconds, headersToSign) {
    var now = timestamp ? new Date(timestamp * 1000) : new Date();
    var rawSessionKey = util.format('bce-auth-v1/%s/%s/%d',
        this.ak, now.toISOString().replace(/\.\d+Z$/, 'Z'), expirationInSeconds || 1800);
    debug('rawSessionKey = %j', rawSessionKey);
    var sessionKey = this.hash(rawSessionKey, this.sk);

    var canonicalUri = this.uriCanonicalization(resource);
    var canonicalQueryString = this.queryStringCanonicalization(params || {});

    var rv = this.headersCanonicalization(headers || {}, headersToSign);
    var canonicalHeaders = rv[0];
    var signedHeaders = rv[1];
    debug('canonicalUri = %j', canonicalUri);
    debug('canonicalQueryString = %j', canonicalQueryString);
    debug('canonicalHeaders = %j', canonicalHeaders);
    debug('signedHeaders = %j', signedHeaders);

    var rawSignature = util.format('%s\n%s\n%s\n%s',
        method, canonicalUri, canonicalQueryString, canonicalHeaders);
    debug('rawSignature = %j', rawSignature);
    debug('sessionKey = %j', sessionKey);
    var signature = this.hash(rawSignature, sessionKey);

    if (signedHeaders.length) {
        return util.format('%s/%s/%s', rawSessionKey, signedHeaders.join(';'), signature);
    }

    return util.format('%s//%s', rawSessionKey, signature);
};

Auth.prototype.uriCanonicalization = function (uri) {
    return strings.normalize(uri,false);
};

/**
 * 生成CanonicalQueryString
 *
 * @see http://gollum.baidu.com/AuthenticationMechanism#生成CanonicalQueryString
 * @param {Object} 请求参数
 * @return {string} canonicalQueryString
 */
Auth.prototype.queryStringCanonicalization = function (params) {
    var canonicalQueryString = [];
    Object.keys(params).forEach(function (key) {
        if (key.toLowerCase() === 'authorization') {
            return;
        }

        var value = params[key] == null ? '' : params[key];
        canonicalQueryString.push(key + '=' + strings.normalize(value));
    });

    canonicalQueryString.sort();

    return canonicalQueryString.join('&');
};

/**
 * 生成CanonicalHeaders
 *
 * @see http://gollum.baidu.com/AuthenticationMechanism#生成CanonicalHeaders
 * @param {Object} 请求头
 * @param {Array.<string>=} 签名中涉及的请求头信息
 * @return {*} CanonicalHeaders
 */
Auth.prototype.headersCanonicalization = function (headers, headersToSign) {
    if (!headersToSign || !headersToSign.length) {
        headersToSign = ['Host', 'Content-MD5', 'Content-Length', 'Content-Type'];
    }
    debug('headers = %j, headersToSign = %j', headers, headersToSign);
    var headersMap = {};
    headersToSign.forEach(function (item) {
        headersMap[item.toLowerCase()] = true;
    });

    var canonicalHeaders = [];
    Object.keys(headers).forEach(function (key) {
        var value = headers[key];
        value = u.isString(value) ? strings.trim(value) : value;
        if (value == null || value === '') {
            return;
        }
        key = key.toLowerCase();
        if (/^x\-bce\-/.test(key) || headersMap[key] === true) {
            canonicalHeaders.push(util.format('%s:%s',
                strings.normalize(key), strings.normalize(value)));
        }
    });

    canonicalHeaders.sort();

    var signedHeaders = [];
    canonicalHeaders.forEach(function (item) {
        signedHeaders.push(item.split(':')[0]);
    });

    return [canonicalHeaders.join('\n'), signedHeaders];
};

Auth.prototype.hash = function (data, key) {
    var crypto = require('crypto');
    var sha256Hmac = crypto.createHmac('sha256', key);
    sha256Hmac.update(data);
    return sha256Hmac.digest('hex');
};

module.exports = Auth;

