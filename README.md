# 百度SMS
基于百度SMS REST API

## 功能
1. 短信下发

## 使用方法
* 安装 `npm install bdsms-nodejs`
* 
```
    var config = {
        'endpoint': 'http://sms.bj.baidubce.com',
        'credentials': {
            'ak': 'ak',
            'sk': 'sk'
        }
    };
    var client = new SmsClient(config);
```
* 下发短信

  ```
  client.sendMessage({
       invokeId: 'invokeId',
       phoneNumber: 'phoneNumber',
       templateCode: 'templateCode',
       contentVar: {
           'code':'code'
       }
   });
  ```