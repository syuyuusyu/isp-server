const Controller =require('egg').Controller;

class InterfaceController extends Controller{

    async interfaces(){
        const body=this.ctx.request.body;
        const result=await this.service.interfaces[body.method](body);
        this.ctx.body=result;

    }
}

module.exports=InterfaceController;