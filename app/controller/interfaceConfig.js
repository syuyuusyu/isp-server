const Controller =require('egg').Controller;

class InterfaceConfig extends Controller{
  async interfaceConfig(){
    let flag=this.ctx.params.flag;
    let result=await this.service.interfaceConfig.getInterfaceConfig(flag);
    this.ctx.body=result;
  }
}
module.exports=InterfaceConfig;
