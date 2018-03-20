module.exports = app => {
    app.beforeStart(async () => {
        // 应用会等待这个函数执行完成才启动
        console.log('app start');
        app.secret='n7d3t7x7';
        app.loginSystem=[];
        console.log(app.redis);
        //初始化单点登录token;
        // const systems=await app.mysql.select('isp_system');
        // for(let i=0;i<systems.length;i++){
        //     app.redis.set(systems[i].code,JSON.stringify([]));
        // }
    });
};