'use strict';
require('./app/util');
require("babel-register");

module.exports = app => {
    app.beforeStart(async () => {
        // 应用会等待这个函数执行完成才启动
        app.logger.info('init app');
        app.logger.info(app.config.discription);


        app.secret = 'n7d3t7x7';
        const ctx = app.createAnonymousContext();


        // 同步集成用户角色到流程引擎
        //ctx.service.authorService.actSynUser();
        app.mysql.modify=false;



        app.logger.info('app started!!!!');
    });

    app.once('server', async server => {
        const ctx = app.createAnonymousContext();
        //实体配置缓存
        await ctx.service.entity.entityCache();
    });

    //实体配置信息缓存
    app.messenger.on('entityCache', data => {
        console.log('entityCache');
        app.entityCache=data;
    });
};







