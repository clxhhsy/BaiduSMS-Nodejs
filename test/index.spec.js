var expect = require('expect.js');

var Auth = require('../lib/auth');
var strings = require('../lib/strings');

var BaiduSMS = require('../lib/index');


describe('Index', function () {
    it('getContentType', function () {
        var baiduSMS = new BaiduSMS('ak', 'sk');
        expect(baiduSMS.getContentType()).to.eql('application/json;charset=utf-8');
    });

    it('setEndPoint', function () {
        var baiduSMS = new BaiduSMS('ak', 'sk');
        baiduSMS.setEndPoint('sms.gz.baidubce.com');
        expect(baiduSMS.getEndPoint()).to.eql('sms.gz.baidubce.com');
    });

    it('sendSmsSingleDevice', function () {
        var baiduSMS = new BaiduSMS('ak', 'sk');
        baiduSMS.sendSmsSingleDevice('', '', '', {});
    });
});