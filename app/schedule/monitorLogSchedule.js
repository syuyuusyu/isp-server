const Subscription = require('egg').Subscription;

class MonitorLog extends Subscription{
  static get schedule() {
    return {
      interval: '20m', // 10 分钟间隔
      type: 'worker', // 指定所有的 worker 都需要执行
    };
  }
  // subscribe 是真正定时任务执行时被运行的函数
  async subscribe() {
    let result=await this.ctx.curl(`127.0.0.1:7001/invoke/self_monitor_list_api`,{
      method:'post',
      data:{},
      headers:{
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      dataType: 'json',
      timeout:20000
    });
    this.service.monitorLog.saveMonitorLog(result);

  }
}
module.exports = MonitorLog;
