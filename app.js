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



function parse(response,head,status=200){
    if(status===200){
        if(response.t.users.length==0){
            return {list:[]};
        }
        let pads=response.t.pads;
        let list=response.t.users.map(u=>{
            let p=pads.find(_=>_.sbid==u.uid);
            console.log(p);
            return {
                id:u.uid,
                name:u.xm,
                location:[p.locations[0].x,p.locations[0].y],
                picture:p.rytx,
                position:u.zw,
                finished:u.gzjd
            };
        });
        return {list:list};
    }else{
        return {list:[]};
    }
}
