const Controller=require('egg').Controller;

class SystemController extends Controller{
    async allSystem(){
        let content=await this.app.mysql.query('select * from isp_system',[]);
        this.ctx.body=content;
    }

    async checkUnique(){
        let [{total}]=await this.app.mysql.query('select count(1) total from isp_system where code=?' ,[this.ctx.params.code]);
        this.ctx.body={total}
    }

    async save(){
        const entity=this.ctx.request.body;
        let result={};
        console.log(entity);
        if(entity.id){
            result = await this.app.mysql.update('isp_system', entity);
        }else {
            result = await this.app.mysql.insert('isp_system', entity); // 更新 posts 表中的记录
        }
        // 判断更新成功
        console.log(result);
        const updateSuccess = result.affectedRows === 1;
        this.ctx.body={success:updateSuccess};
    }

    async delete(){
        const result = await this.app.mysql.delete('isp_system', {
            id: this.ctx.params.id
        });
        const updateSuccess = result.affectedRows === 1;
        this.ctx.body={success:updateSuccess};
    }
}

module.exports= SystemController;

