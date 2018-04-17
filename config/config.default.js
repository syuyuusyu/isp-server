'use strict';

module.exports = appInfo => {
  const config = {};

  config.view = {
    defaultViewEngine: 'nunjucks',
  };

  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1517886399328_119';

  // add your config here
  config.middleware = [
    'author',
    'swiftToken',
    'cloudToken',
    'bigDataToken'

  ];

  config.author = {
    ignore: /\/test|\/login|\/index|\/static|^\/interface/,
  };

  config.swiftToken = {
    match: /\/swift/,
  };

  config.cloudToken = {
    match: /\/invoke\/cloud/
  };

  config.bigDataToken = {
    match: /\/invoke\/data/
  };


  config.multipart = {
    fileExtensions: ['.apk', '.xls', '.doc', '.docx', '.xlsx', '.pdf', '.mkv'],
  };

  config.mysql = {
    client: {
      // host
      host: '10.10.50.16',
      // 端口号
      port: '3306',
      // 用户名
      user: 'root',
      // 密码
      password: '1234',
      // 数据库名
      database: 'isp',
    },
    // 是否加载到 app 上，默认开启
    app: true,
    // 是否加载到 agent 上，默认关闭
    agent: false,
  };

  // config.mysql={
  //     client: {
  //         host: '127.0.0.1',
  //         port: '3306',
  //         user: 'root',
  //         password: '1234',
  //         database: 'isp',
  //     },
  //     app: true,
  //     agent: false,
  // };

  config.redis = {
    client: {
      port: 6379,          // Redis port
      host: '10.10.50.16',   // Redis host
      password: '',
      db: 0,
    },
  };

  config.security = {
    csrf: {
      ignoreJSON: true, // 默认为 false，当设置为 true 时，将会放过所有 content-type 为 `application/json` 的请求
      enable: false
    },
    domainWhiteList: ['http://10.10.50.16:5000', 'http://10.100.5.13:5000', 'http://localhost:3000', 'http://10.100.5.13:3000', 'http://10.10.50.16:3000', 'http://192.168.3.11:3000', 'http://localhost:7001', 'http://127.0.0.1:3000']
  };

  config.cors = {
    allowMethods: 'GET,PUT,POST,DELETE,OPTIONS',
    credentials: true
  };

  config.self = {
    cloudIp: '10.10.50.12',
    bigDataIp: '10.10.0.2:8888',
    keystoneIp: '10.10.0.1:5000',
    swiftBaseUrl: 'http://10.10.0.1:8080/v1/AUTH_491ec2831b2146b18fb8bf0c0ab4a1e5/',
  };

  return config;
};
