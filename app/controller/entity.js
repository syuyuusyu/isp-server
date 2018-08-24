const Controller=require('egg').Controller;
const {smartQuery}=require('../util');

class EntityController extends Controller{

    @smartQuery
    async columns(){
        let result=await this.app.mysql.query(
            `select * from entity_column where entityId=? order by id,columnIndex`,[this.ctx.params.entityId]);
        this.ctx.body=result;
    }

    async column(){
        let [result]=await this.app.mysql.query(
            `select * from entity_column where id=?`,[this.ctx.params.id]);
        this.ctx.body=result;
    }


    async entitys(){
        let result=await this.app.mysql.query(
            `select * from entity`,[]
        );
        this.ctx.body=result;
    }


    async saveConfig(){
        const entity=this.ctx.request.body;
        let result = await this.app.mysql[entity[this.ctx.params.idField]?'update':'insert'](this.ctx.params.tableName, entity);
        // 判断更新成功
        const updateSuccess = result.affectedRows === 1;
        this.ctx.body={success:updateSuccess};
    }

    async deleteConfig(){
        const result = await this.app.mysql.delete(this.ctx.params.tableName, {
            [this.ctx.params.idField]: this.ctx.params.id
        });
        const updateSuccess = result.affectedRows === 1;
        this.ctx.body={success:updateSuccess};
    }

    async tableNames(){
        this.ctx.body=await this.app.mysql.query(`select table_name tableName from information_schema.TABLES where TABLE_SCHEMA=?`
            ,[this.app.config.mysql.client.database]);
    }

    async originalColumns(){
        this.ctx.body=await this.app.mysql.query(
            `select table_name,column_name,ordinal_position,data_type,column_key from information_schema.COLUMNS where TABLE_SCHEMA=?`,
            [this.app.config.mysql.client.database]);
    }

    async monyToMonys(){
        this.ctx.body=await this.app.mysql.query(`select * from entity_mony_to_mony`);
    }

    async query(){
        const entityId=this.ctx.params.entityId;

    }
}

module.exports=EntityController;