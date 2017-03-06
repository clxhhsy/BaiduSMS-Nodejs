# 百度SMS
基于百度SMS REST API

## 功能
1. 短信下发

## 使用方法
* 安装 `npm install bdsms-nodejs`
* `var baiduSMS = new BaiduSMS("ak","sk")`
* 设置服务域名,默认`sms.bj.baidubce.com`  
  `baiduSMS.setEndPoint(endPoint)`
* 下发短信

  `
  baiduSMS.sendSmsSingleDevice(invokeId,phoneNumber,templateCode,contentVar);
  `