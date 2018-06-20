const Subscription = require('egg').Subscription;

class InterfacesLog extends Subscription {
    // 通过 schedule 属性来设置定时任务的执行间隔等配置
    static get schedule() {
        return {
            interval: '15s', // 10 分钟间隔
            type: 'all', // 指定所有的 worker 都需要执行
        };
    }

    // subscribe 是真正定时任务执行时被运行的函数
    async subscribe() {
      //const interfaceInfoApp=await this.app.interfaceLog;
      let interfaceInfoArray=[];
      //从redis中取出interfaceInfo的值，并将interfaceInfo的值转换成数组类型
      let interfaceInfo=await this.app.redis.smembers("interfaceInfo");
      if(interfaceInfo.length!==0){
        for(let interfaceInfoValue of interfaceInfo ){
          interfaceInfoValue=interfaceInfoValue.split("----");
          //因为转换成的数组中最后一位的stateflag元素的值为字符串类型，将其转换为int类型
          interfaceInfoValue[interfaceInfoValue.length-1]=parseInt(interfaceInfoValue[interfaceInfoValue.length-1]);
          interfaceInfoArray.push(interfaceInfoValue);
        }
        let sql=`insert into t_interfaces_log(initiativeSystem,initiativeSystem_CN,initiative_ip,system,system_cn,ip,interfaces_name,reqdate_info,response_info,response_status,message,invoke_date,create_by,create_time,stateflag) values
        ${interfaceInfoArray.map(a=>{return '('+ a.map(b=>"'"+b+"'").join(',')+')'}).reduce((a,b)=>a+','+b) }`;
        //console.log("sql的值为：",sql);
        await this.app.mysql.query(sql);
        //清除数组和redis里面的数据
        interfaceInfoArray.length=0;
        this.app.redis.del("interfaceInfo");
      }

      /*interfaceInfo=interfaceInfo.split("----");
       if(interfaceInfoValue.length!==0){
        let sql=`insert into t_interfaces_log(initiativeSystem,initiativeSystem_CN,initiative_ip,system,system_cn,ip,interfaces_name,reqdate_info,response_info,response_status,message,invoke_date,create_by,create_time,stateflag) values
        ${interfaceInfoValue.map(a=>{return '('+ a.map(b=>"'"+b+"'").join(',')+')'}).reduce((a,b)=>a+','+b) }`;
        console.log("sql的值为：",sql);
        await this.app.mysql.query(sql);
           interfaceInfo.length=0;
    }
*/
}}

module.exports = InterfacesLog;
