module.exports = app => {
    app.beforeStart(async () => {
        // 应用会等待这个函数执行完成才启动
        const aq=`[ { 'cloud_servers_list-1': 
     [ [Object],
       [Object],
       [Object],
       [Object],
       [Object],
       [Object],
       [Object],
       [Object],
       [Object],
       [Object],
       [Object],
       [Object],
       [Object],
       [Object],
       [Object],
       [Object],
       [Object],
       [Object],
       [Object],
       [Object] ],
    'cloud_servers_status-2': [],
    'cloud_servers_status-3': [],
    'cloud_servers_status-4': [],
    'cloud_servers_status-5': [],
    'cloud_servers_status-6': [],
    'cloud_servers_status-7': [],
    'cloud_servers_status-8': [],
    'cloud_servers_status-9': [],
    'cloud_servers_status-10': [],
    'cloud_servers_status-11': [],
    'cloud_servers_status-12': [],
    'cloud_servers_status-13': [],
    'cloud_servers_status-14': [],
    'cloud_servers_status-15': [],
    'cloud_servers_status-16': [],
    'cloud_servers_status-17': [],
    'cloud_servers_status-18': [],
    'cloud_servers_status-19': [],
    'cloud_servers_status-20': [],
    'cloud_servers_status-21': [] } ]`;

        //parse(JSON.parse(aq));


        console.log('app start');
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



function parse(obj){
    obj=obj[0];
    let serverlist=[];
    let status=[];
    for(let key in obj){
        if(key.indexOf('cloud_servers_list')===0){
            serverlist=obj[key];
        }
        if(key.indexOf('cloud_servers_status')===0){
            status.push(obj[key]);
        }
    }
    for(let i=0;i<serverlist.length;i++){
        serverlist[i].status=status.filter(d=>d.serverId===serverlist[i].serverId)[0].status;
        delete serverlist[i].links;
        delete serverlist[i].serverId;
    };
    return serverlist;
}