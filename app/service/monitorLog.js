const Service = require('egg').Service;

class MonitorLog extends Service{
  async saveMonitorLog(result){
    let data=result.data;
    for(let i of data){
      this.app.mysql.query('insert into t_monitor_log(instance_name,disk_usage,disk_root_size,memory_usage,memory,cpu_util,vcpus) value(?,?,?,?,?,?,?)',[i.instanceName,i['disk.usage'],i['disk.root.size'],i['memory.usage'],i.memory,i['cpu_util'],i.vcpus]);
    }
  }

  async allMonitorLog(){
    let result=await this.app.mysql.query('select * from t_monitor_log where stateflag=1 order by operate_date desc',[]);
    return result;
  }

  async allInstanceName(){
    let result=await this.app.mysql.query('select DISTINCT instance_name from t_monitor_log where stateflag=1',[]);
    return result;
  }
}
module.exports = MonitorLog;
