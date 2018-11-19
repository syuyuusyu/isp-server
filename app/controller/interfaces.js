//import InterfacesLog from '../service/InterfacesLog';
const Controller =require('egg').Controller;

class InterfaceController extends Controller{
  async interfaces(){
    const body=this.ctx.request.body;
    this.ctx.logger.info(body);
    const result=await this.service.interfaces[body.method](body);
    this.ctx.body=result;
    //this.log(body,result);
    this.service.interfacesLog.log(body,result);
  }

}

module.exports=InterfaceController;
