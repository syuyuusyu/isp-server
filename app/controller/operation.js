const Controller=require('egg').Controller;

class OperationController extends Controller{

    async operations(){
        let result=await this.app.mysql.query(`select * from isp_sys_operation where system_id=?`,[this.ctx.params.sysId]);
        this.ctx.body=result;
    }

    async delete(){
        const result = await this.app.mysql.delete('isp_sys_operation', {
            id: this.ctx.params.id
        });
        const updateSuccess = result.affectedRows === 1;
        this.ctx.body={success:updateSuccess};
    }

    async save(){
        const entity=this.ctx.request.body;
        let result={};
        console.log(entity);
        if(entity.id){
            result = await this.app.mysql.update('isp_sys_operation', entity);
        }else {
            result = await this.app.mysql.insert('isp_sys_operation', entity); // 更新 posts 表中的记录
        }
        // 判断更新成功
        console.log(result);
        const updateSuccess = result.affectedRows === 1;
        this.ctx.body={success:updateSuccess};
    }
}

module.exports= OperationController;