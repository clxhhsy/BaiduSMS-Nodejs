/**
 * Copyright (c) 2014 Baidu.com, Inc. All Rights Reserved
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on
 * an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations under the License.
 *
 * @file sdk/ses_client.spec.js
 * @author leeight
 */
var expect = require('expect.js');

var config = require('./config');
var SmsClient = require('../lib/index');

describe('SmsClient', function () {
    var client;

    this.timeout(10 * 60 * 1000);

    beforeEach(function () {
        client = new SmsClient(config.sms);
    });

    afterEach(function () {
        // nothing
    });

    it('sendMessage', function () {
        // return client.sendMessage({
        //     invokeId: 'invokeId',
        //     phoneNumber: 'phoneNumber',
        //     templateCode: 'templateCode',
        //     contentVar: {
        //         'code':'code'
        //     }
        // }).then(function (response) {
        //     console.log(response);
        //     expect(response.body.requestId).not.to.be(undefined);
        // });
    });

});


/* vim: set ts=4 sw=4 sts=4 tw=120: */
