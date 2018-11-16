const Controller=require('egg').Controller;

class OperationController extends Controller{

    async operations(){
        let result=await this.app.mysql.query(`select * from t_sys_operation where system_id=? and type<>3 and stateflag=1`,[this.ctx.params.sysId]);
        this.ctx.body=result;
    }

    // async delete(){
    //     const result = await this.app.mysql.delete('t_sys_operation', {
    //         id: this.ctx.params.id
    //     });
    //     const updateSuccess = result.affectedRows === 1;
    //     this.ctx.body={success:updateSuccess};
    // }
    //
    // async save(){
    //     const entity=this.ctx.request.body;
    //     const updateSuccess = await this.service.operation.save(entity);
    //     this.ctx.body={success:updateSuccess};
    // }

    async save() {
        this.ctx.body = { success: await this.ctx.service.saveOrDelete.save('t_sys_operation',this.ctx.request.body)};
    }

    async delete() {
        this.ctx.body = { success: await this.ctx.service.saveOrDelete.delete('t_sys_operation',this.ctx.params.id) };
    }



    async invokeOperations(){
        let result=await this.app.mysql.query(`select * from t_sys_operation where system_id=? and type=3 and stateflag=1`,[this.ctx.params.sysId]);
        this.ctx.body=result;
    }

    //有权限访问就接口的系统
    async invokePromiss(){
        let result=await this.app.mysql.query(`select * from t_sys_promiss_operation where operation_id=?`,[this.ctx.params.operationId]);
        this.ctx.body=result;
    }

    async saveInvokePromiss(){
        const {operationId,sysIds}=this.ctx.request.body;


        let result={};
        const conn = await this.app.mysql.beginTransaction(); // 初始化事务

        try {
            await conn.delete('t_sys_promiss_operation', {
                operation_id: operationId,
            });  // 第一步操作
            if (sysIds.length>0){
                let sql=`insert into t_sys_promiss_operation(operation_id,system_id) 
                        values ${sysIds.map((a)=>'('+operationId+','+a+')').reduce((a,b)=>a+','+b)}`;
                result=await conn.query(sql);
            }else{
                result.affectedRows = 0
            }

            await conn.commit(); // 提交事务
        } catch (err) {
            await conn.rollback(); // 一定记得捕获异常后回滚事务！！
            throw err;
        }
        const updateSuccess = result.affectedRows === sysIds.length;
        if(updateSuccess){
            this.service.authorService.invokePromiss();
        }
        this.ctx.body={success:updateSuccess};
    }
}

module.exports= OperationController;
