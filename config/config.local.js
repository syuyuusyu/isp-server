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
        'supmapToken',
        'aptToken',
        'cloudTokenNew'
    ];

    config.author = {
        ignore: /\/test|\/login|\/index|\/static|^\/invoke|^\/interfaces|^\/userRegister|^\/activiti|^\/map$|^\/doNothing$|^\/screen/,
    };

    config.swiftToken = {
        match: /\/swift|\/invoke\/self_monitor/,
    };

    config.cloudToken = {
        match: /\/invoke\/cloud|\/s02Url\/getS02Url/
    };

    config.bigDataToken = {
        match: /\/invoke\/data/
    };
    config.supmapToken = {
        match: /\/invoke\/map/
    };
    config.aptToken = {
        match: /\invoke\/apt/
    }
    config.cloudTokenNew = {
        match: /\invoke\/newcloud/
    }


    config.multipart = {
        //fileExtensions: ['.jar'],
        whitelist: fileName => true,
        fileSize: '102400mb',
    };


    config.mysql = {
        client: {
            // host
            host: '10.10.12.1',
            // 端口号
            port: '3306',
            // 用户名
            user: 'isp',
            // 密码
            password: 'liuge1',
            // 数据库名
            database: 'isp',
        },
        // 是否加载到 app 上，默认开启
        app: true,
        // 是否加载到 agent 上，默认关闭
        agent: false,
    };

    // config.mysql = {
    //     client: {
    //         // host
    //         host: '127.0.0.1',
    //         // 端口号
    //         port: '3306',
    //         // 用户名
    //         user: 'root',
    //         // 密码
    //         password: '1234',
    //         // 数据库名
    //         database: 'isp',
    //     },
    //     // 是否加载到 app 上，默认开启
    //     app: true,
    //     // 是否加载到 agent 上，默认关闭
    //     agent: false,
    // };
    // config.mysql = {
    //     client: {
    //         host: '192.168.1.11',
    //         port: '3306',
    //         user: 'root',
    //         password: '1q2w3e4r',
    //         database: 'isp',
    //     },
    //     app: true,
    //     agent: false,
    // };

    // config.redis = {
    //     client: {
    //         port: 6379,
    //         host: '127.0.0.1',
    //         password: '',
    //         db: 0,
    //     },
    // };
    config.redis = {
        client: {
            port: 6379,
            host: '10.10.50.14',
            password: '',
            db: 0,
        },
    };


    config.security = {
        csrf: {
            ignoreJSON: true, // 默认为 false，当设置为 true 时，将会放过所有 content-type 为 `application/json` 的请求
            enable: false
        },
        domainWhiteList: [
            'http://localhost:3000',
            'http://127.0.0.1:3000',
            'http://localhost:8080',
            'http://10.10.50.10:3000',
            'http://10.10.50.14:3000',
            'http://10.10.50.17:3000',
            'http://10.10.50.9',
            'http://10.10.50.16',
            'http://127.0.0.1',
            'https://127.0.0.1',
            'http://10.10.0.227:3000',
            'http://192.168.0.101:3000',
            'http://192.168.0.106:3000'
        ]
    };

    config.cors = {
        allowMethods: 'GET,PUT,POST,DELETE,OPTIONS',
        credentials: true
    };

    config.self = {
        keystoneIp: '10.10.10.1:5000',
        swiftBaseUrl: 'http://10.10.10.1:8080/v1/AUTH_76feacc2ae3c45f9b280e46dd96ff2ce/',
        activitiIp: 'http://127.0.0.1:5001',
        //activitiIp: 'https://10.10.50.10:5002',
        //rabbitmqUrl:'amqp://admin:123456@10.10.50.10:5672',
        rabbitmqUrl: 'amqp://guest:guest@127.0.0.1:5672',
        queueName: 'activitiQueue'
    };

    // config.self = {
    //     keystoneIp: '192.168.1.10:5000',
    //     swiftBaseUrl: 'http://192.168.1.10:8081/v1/AUTH_5cd6ec64b5504fc481de338c6e7e60fb',
    //     activitiIp: 'http://127.0.0.1:5001',
    //     //activitiIp: 'https://10.10.50.10:5002',
    //     //rabbitmqUrl:'amqp://admin:123456@10.10.50.10:5672',
    //     rabbitmqUrl: 'amqp://guest:guest@127.0.0.1:5672',
    //     queueName: 'activitiQueue'
    // };

    config.discription = 'local22';

    return config;

};
