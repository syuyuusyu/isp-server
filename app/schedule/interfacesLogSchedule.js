const Subscription = require('egg').Subscription;

class InterfacesLog extends Subscription {
    // 通过 schedule 属性来设置定时任务的执行间隔等配置
    static get schedule() {
        return {
            interval: '10m', // 10 分钟间隔
            type: 'all', // 指定所有的 worker 都需要执行
        };
    }

    // subscribe 是真正定时任务执行时被运行的函数
    async subscribe() {
      const interfaceInfo=await this.app.interfaceLog;
      //console.log("定时调度中的interfaceInfo的值为：",interfaceInfo);

       if(interfaceInfo.length!==0){
        let sql=`insert into t_interfaces_log(initiativeSystem,initiativeSystem_CN,initiative_ip,system,system_cn,ip,interfaces_name,reqdate_info,response_info,response_status,message,invoke_date,create_by,create_time,stateflag) values 
        ${interfaceInfo.map(a=>{return '('+ a.map(b=>"'"+b+"'").join(',')+')'}).reduce((a,b)=>a+','+b) }`;
        //console.log("sql的值为：",sql);
        await this.app.mysql.query(sql);
           interfaceInfo.length=0;
    }

}}

module.exports = InterfacesLog;
