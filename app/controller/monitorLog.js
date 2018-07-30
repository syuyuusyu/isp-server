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

  async getQueryMonitorLog(){
    const instanceName=this.ctx.request.body.instanceName;
    const startValue=this.ctx.request.body.startValue;
    const endValue=this.ctx.request.body.endValue;
    let content=await this.service.monitorLog.queryMonitorLog(instanceName,startValue,endValue);
    //console.log("instanceName,startValue,endValue的值为:",instanceName,startValue,typeof startValue,endValue,typeof endValue);
    this.ctx.body=content;
  };
}
module.exports=MonitorLogController;
