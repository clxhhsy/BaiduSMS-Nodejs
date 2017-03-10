var BceBaseClient = require('./bce_base_client');

var util = require('util');


/**
 * SMS service api
 *
 * @constructor
 * @param {Object} config The bos client configuration.
 * @extends {BceBaseClient}
 */
function SmsClient(config) {
    BceBaseClient.call(this, config, 'sms', true);
}
util.inherits(SmsClient, BceBaseClient);

SmsClient.prototype.sendMessage = function (smsOptions) {
    var invokeId = smsOptions.invokeId || '';
    var phoneNumber = smsOptions.phoneNumber || '';
    var templateCode = smsOptions.templateCode || '';
    var contentVar = smsOptions.contentVar || {};
    var url = '/bce/v2/message';
    var body = JSON.stringify({
        invokeId: invokeId,
        phoneNumber: phoneNumber,
        templateCode: templateCode,
        contentVar: contentVar
    });
    return this.sendRequest('POST', url, {body: body});
};

module.exports = SmsClient;