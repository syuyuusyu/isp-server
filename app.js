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
        //await app.runSchedule('inital');
        //let ids=await ctx.service.saveOrDelete.childList(21,'id','parent_id','t_menu');
        app.logger.info('app started!!!!');
    });

    app.once('server', async server => {

    });

    app.messenger.on('xxx_action', data => {
        app.logger.info('xxx_action',data);
    });
};







