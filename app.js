module.exports = app => {
    app.beforeStart(async () => {
        // 应用会等待这个函数执行完成才启动
        console.log('app start');
        app.secret='n7d3t7x7';
        app.loginSystem=[];

        let systems=await app.mysql.query(`select * from isp_system`);
        for(let system of systems){
            let operations=await app.mysql.query(`select o.* from isp_sys_operation o join isp_sys_promiss_operation spo 
                on spo.operation_id=o.id where spo.system_id=?`,[system.id]);
            await app.redis.set(system.url,JSON.stringify(operations.map(m=>m.code)));
        }
    });
    // app.afterStart(async ()=>{
    //     //初始化系统调用接口权限
    //     console.log(2222);
    //     await app.service.authorityStore.invokePromiss();
    // });
};