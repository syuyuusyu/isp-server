const Controller=require('egg').Controller;

class EntityController extends Controller{

    async columns(){
        this.ctx.body=await this.app.mysql.query(
            `select * from entity_column where entityId=? order by columnIndex`,[this.ctx.params.entityId]);
    }

    async entitys(){
        this.ctx.body=await this.app.mysql.query(
            `select * from entity`,[]
        );
    }

    async allDictionary(){
        this.ctx.body=await this.app.mysql.query(`select DISTINCT groupId,groupName from entity_dictionary`,[]);
    }

    async saveColumn(){
        const entity=this.ctx.request.body;
        let result = await this.app.mysql[entity.id?'update':'insert']('entity_column', entity);
        // 判断更新成功
        const updateSuccess = result.affectedRows === 1;
        this.ctx.body={success:updateSuccess};
    }

    async deleteColumn(){
        const result = await this.app.mysql.delete('entity_column', {
            id: this.ctx.params.id
        });
        const updateSuccess = result.affectedRows === 1;
        this.ctx.body={success:updateSuccess};
    }
}

module.exports=EntityController;