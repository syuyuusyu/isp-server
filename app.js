module.exports = app => {
    app.beforeStart(async () => {
        //清除redis缓存
        let redisKeys=await app.redis.keys('*');
        for(let key of redisKeys){
            console.log(key);
            await app.redis.del(key);
        }

        app.secret='n7d3t7x7';
        app.loginSystem=[];
        app.systemMap={};
        app.systemUrl={};
        app.interfaceLog=[];


        //初始化系统调用接口权限
        let systems=await app.mysql.query(`select * from isp_system`);
        for(let system of systems){
            app.systemMap[system.code]=system.id;
            app.systemUrl[system.code]=system.url;
            let operations=await app.mysql.query(`select o.* from isp_sys_operation o join isp_sys_promiss_operation spo 
                on spo.operation_id=o.id where spo.system_id=?`,[system.id]);
            await app.redis.set(system.url,JSON.stringify(operations.map(m=>m.path)));
        }

        //初始化接口调用实体
        app.invokeEntitys=await app.mysql.query(`select * from invoke_info`);

        app.logger.info('app start');
    });

    app.once('server', server => {
        //app.logger.info(server.restful);
    });
};