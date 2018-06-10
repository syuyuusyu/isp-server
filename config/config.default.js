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
    'bigDataToken',
  ];

  config.author = {
    ignore: /\/test|\/login|\/index|\/static|^\/invoke|^\/interfaces|^\/userRegister|^\/activiti/,
  };

  config.swiftToken = {
    match: /\/swift/,
  };

  config.cloudToken = {
    match: /\/invoke\/cloud/,
  };

  config.bigDataToken = {
    match: /\/invoke\/data/,
  };


  config.multipart = {
    fileExtensions: [ '.apk', '.xls', '.doc', '.docx', '.xlsx', '.pdf', '.mkv', '.sql', '.flac' ],
    fileSize: '1024mb',
  };

  // config.mysql = {
  //     client: {
  //         // host
  //         host: '10.10.50.21',
  //         // 端口号
  //         port: '3306',
  //         // 用户名
  //         user: 'root',
  //         // 密码
  //         password: 'isp5t6y',
  //         // 数据库名
  //         database: 'isp2',
  //     },
  //     // 是否加载到 app 上，默认开启
  //     app: true,
  //     // 是否加载到 agent 上，默认关闭
  //     agent: false,
  // };

  config.mysql = {
    client: {
      host: '192.168.2.141',
      port: '3306',
      user: 'root',
      password: '1234',
      database: 'isp',
    },
    app: true,
    agent: false,
  };

  config.redis = {
    client: {
      port: 6379, // Redis port
      host: '127.0.0.1', // Redis host
      password: '',
      db: 0,
    },
  };

  config.security = {
    csrf: {
      ignoreJSON: true, // 默认为 false，当设置为 true 时，将会放过所有 content-type 为 `application/json` 的请求
      enable: false,
    },
    domainWhiteList: [
      'http://10.10.50.16:3000',
      'http://localhost:3000',
      'http://192.168.3.11:3000',
      'http://localhost:7001',
      'http://10.10.0.227:3000',
      'http://10.10.0.119:3000',
      'http://127.0.0.1:3000',
      'http://10.10.50.21:3000',
      'http://10.10.0.228:3000',
      'http://10.10.0.228:8080',
    ],
  };

  config.cors = {
    allowMethods: 'GET,PUT,POST,DELETE,OPTIONS',
    credentials: true,
  };

  config.self = {
    keystoneIp: '10.10.0.1:5000',
    swiftBaseUrl: 'http://10.10.0.1:8080/v1/AUTH_8caa6e28cf7049d48b9c5274c8cb524e/',
    activitiIp: 'http://127.0.0.1:5002',
  };

  return config;

};
