module.exports = app => {
    app.beforeStart(async () => {
        // 应用会等待这个函数执行完成才启动
        console.log('app start');
        app.secret='n7d3t7x7';
        app.loginSystem=[];
        app.systemMap={};
        app.interfaceLog=[];
        app.allRouter=[];


        //初始化系统调用接口权限
        let systems=await app.mysql.query(`select * from isp_system`);
        for(let system of systems){
            app.systemMap[system.code]=system.id;
            let operations=await app.mysql.query(`select o.* from isp_sys_operation o join isp_sys_promiss_operation spo 
                on spo.operation_id=o.id where spo.system_id=?`,[system.id]);
            await app.redis.set(system.url,JSON.stringify(operations.map(m=>m.path)));
        }

        //初始化接口调用实体
        app.invokeEntitys=await app.mysql.query(`select * from invoke_info`);

      //初始化获取所有增，改，查的路由
      let content=await app.mysql.query(`select router_name from router_map`);
      for(let i=0;i<content.length;i++){
        app.allRouter.push(content[i].router_name)
      }
      app.allRouter=app.allRouter.toString();
    });

    app.once('server', server => {
        //app.logger.info(server.restful);
    });
};
