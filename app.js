module.exports = app => {
    app.beforeStart(async () => {
        // 应用会等待这个函数执行完成才启动
        app.logger.info('init app');
        Array.prototype.indexOf = Array.prototype.indexOf ? Array.prototype.indexOf
            : (o, from) => {
                from = from || 0;
                var len = this.length;
                from += (from < 0) ? len : 0;
                for (; from < len; from++) {
                    if (this[from] === o)
                        return from;
                }
                return -1;
            };

        Array.prototype.remove = Array.prototype.remove ? Array.prototype.remove
            : (o) => {
                let index = this.indexOf(o);
                if (index != -1) {
                    this.splice(index, 1);
                }
            };


        app.secret = 'n7d3t7x7';
        const ctx = app.createAnonymousContext();


        // 同步集成用户角色到流程引擎
        //ctx.service.authorService.actSynUser();
        //await app.runSchedule('inital');



        app.logger.info('app started!!!!');
    });

    app.once('server', server => {

    });

    app.messenger.on('xxx_action', data => {
        app.logger.info('xxx_action',data);
    });
};


function parse(obj){
    let isOk=true;
    if(obj.forEach){
        obj.forEach(o=>{
            if(o['self_monitor_list-1'] && o['self_monitor_list-1'].status){
                isOk=false;
            }
        });
    }
    if(!isOk){
        return {status:401};
    }
    let result=[];
    for(let key in obj[0]){
        if(/(self_monitor_detail)-\d+/.test(key))
            result.push(obj[0][key]);
    }
    console.log(result);
    let instenceNames=new Set();
    result.forEach(o=>instenceNames.add(o.instanceName));
    let table=[];
    instenceNames.forEach(n=>table.push({instanceName:n}));
    while(result.length>0){
        let o=result.pop();
        for(let i=0;i<table.length;i++){
            if(table[i].instanceName===o.instanceName){
                table[i]={
                    ...table[i],
                    [o.propertyName]:o.value
                };
            }
        }

    }
    return table;
}

