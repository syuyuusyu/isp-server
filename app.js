module.exports = app => {
    app.beforeStart(async () => {
        // 应用会等待这个函数执行完成才启动
        console.log('init app');
        const ctx = app.createAnonymousContext();

        app.secret='n7d3t7x7';
        app.loginSystem=[];
        app.systemMap={};
        app.systemUrl={};
        app.interfaceLog=[];
        app.allRouter=[];

        //清空redis
        // const keys=await app.redis.keys('*');
        // for(let key of keys){
        //     app.redis.del(key);
        // }


        //初始化系统调用接口权限
        await ctx.service.authorService.invokePromiss();

        //初始化接口调用实体
        app.invokeEntitys=await app.mysql.query(`select * from t_invoke_info`);

        //初始化获取所有增，改，查的路由
        let content=await app.mysql.query(`select router_name from t_router_map`);
        for(let i=0;i<content.length;i++){
            app.allRouter.push(content[i].router_name)
        }
        app.allRouter=app.allRouter.toString();

        //同步集成用户角色到流程引擎
        //ctx.service.authorService.actSynUser();
        let activitiIp='http://127.0.0.1:5002';
        let username='admin';
        let system='s09';
        console.log('-----------',`${activitiIp}/userTask/${username+system}`);
        let tasks=await app.curl(`${activitiIp}/userTask/${username+system}`,{
            method:'GET',
            head:{
                "Accept":"application/json",
                "Content-Type":"application/json;charset=UTF-8"
            },
            dataType: 'json',
        });
        console.log(tasks);

    });

    app.once('server', server => {

    });
};









