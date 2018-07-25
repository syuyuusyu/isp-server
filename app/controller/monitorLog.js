const Controller =require('egg').Controller;

class MonitorLogController extends Controller{
  async getAllMonitorLog(){
    let content=await this.service.monitorLog.allMonitorLog();
    this.ctx.body=content;
  };

  async getAllInstanceName(){
    let content=await this.service.monitorLog.allInstanceName();
    this.ctx.body=content;
  };
}
module.exports=MonitorLogController;
