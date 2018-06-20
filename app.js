module.exports = app => {
    app.beforeStart(async () => {
        // 应用会等待这个函数执行完成才启动
        console.log('init app');

        app.secret='n7d3t7x7';
        app.loginSystem=[];
        app.systemMap={};
        app.systemUrl={};
        //app.interfaceLog=[];
        //app.allRouter=[];

        //清空redis
        // const keys=await app.redis.keys('*');
        // for(let key of keys){
        //     app.redis.del(key);
        // }


        //初始化系统调用接口权限
        let systems=await app.mysql.query(`select * from t_system where stateflag=1`);
        for(let system of systems){
            app.systemMap[system.code]=system.id;
            app.systemUrl[system.code]=system.url;
            let operations=await app.mysql.query(`select o.* from t_sys_operation o join t_sys_promiss_operation spo 
                on spo.operation_id=o.id where spo.system_id=? and o.stateflag=1`,[system.id]);
            await app.redis.set(system.url,JSON.stringify(operations.map(m=>m.path)));
        }

        //初始化接口调用实体
        app.invokeEntitys=await app.mysql.query(`select * from t_invoke_info`);

        /*//初始化获取所有增，改，查的路由
        let content=await app.mysql.query(`select router_name from t_router_map`);
        for(let i=0;i<content.length;i++){
            app.allRouter.push(content[i].router_name)
        }
        app.allRouter=app.allRouter.toString();*/

        //app.mysql.insert('t_test',{name:'sdsd',age:3,time:new Date()});
        console.log('app start');

    });

    app.once('server', server => {
        //app.logger.info(server.restful);
    });
};









