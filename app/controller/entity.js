const Controller=require('egg').Controller;
//const {log}=require('../util');

class EntityController extends Controller{

    @log
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

function log(target, name, descriptor) {
    var oldValue = descriptor.value;

    descriptor.value = function() {
        target.ctx.logger.info(`Calling ${name} with`, arguments);
        return oldValue.apply(this, arguments);
    };
    return descriptor;
}

module.exports=EntityController;