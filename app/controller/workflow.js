const Controller =require('egg').Controller;

class WorkFlowController extends Controller{

    async cloudApplyLog(){
        const {username}=this.ctx.request.body;
        const result=await this.app.mysql.query(`select * from cloud_apply_log where username=?`,[username]);
        this.ctx.body=result;
    }
}

module.exports=WorkFlowController;