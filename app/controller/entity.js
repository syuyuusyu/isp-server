const Controller=require('egg').Controller;
const {smartQuery,lowCaseResult,lowCaseResponseBody}=require('../util');

class EntityController extends Controller{

    async columns(){
        this.ctx.body=await this.service.entity.columns(parseInt(this.ctx.params.entityId));
    }

    async entityOperations(){
        this.ctx.body=await this.service.entity.entityOperations(parseInt(this.ctx.params.entityId));
    };

    async column(){
        let [result]=await this.app.mysql.query(
            `select * from entity_column where id=?`,[this.ctx.params.id]);
        this.ctx.body=result;
    }


    async entitys(){
        this.ctx.body=await this.service.entity.entitys();
    }


    async saveConfig(){
        this.ctx.body=
            await this.service.entity.saveConfig(this.ctx.request.body,this.ctx.params.tableName,this.ctx.params.idField);
    }

    async deleteConfig(){
        this.ctx.body=
            await this.service.entity.deleteConfig(this.ctx.params.tableName,this.ctx.params.idField,this.ctx.params.id);
    }

    async tableNames(){
        this.ctx.body=await this.app.mysql.query(`select table_name tableName from information_schema.TABLES where TABLE_SCHEMA=?`
            ,[this.app.config.mysql.client.database]);
    }

    @lowCaseResponseBody
    async originalColumns(){
        this.ctx.body=await this.app.mysql.query(
            `select table_name,column_name,ordinal_position,data_type,column_key from information_schema.COLUMNS where TABLE_SCHEMA=?`,
            [this.app.config.mysql.client.database]);
    }

    async monyToMonys(){
        this.ctx.body=await this.app.mysql.query(`select * from entity_mony_to_mony`);
    }

    async query(){
        this.ctx.body=await await this.service.entity.query(this.ctx.params.entityId,this.ctx.request.body);
    }

    async topParentRecord(){
        this.ctx.body=await this.service.entity.topParentRecord(this.ctx.params.entityId);
    }

    async queryCandidate(){
        this.ctx.body=
            await this.service.entity.queryCandidate(parseInt(this.ctx.params.columnId),this.ctx.request.body);
    }

    async checkUnique(){
        this.ctx.body=
            await this.service.entity.checkUnique(this.ctx.params.entityId,this.ctx.params.checkField,this.ctx.params.value);
    }

    async saveEntity(){
        this.ctx.body=
            await this.service.entity.saveEntity(this.ctx.params.entityId,this.ctx.request.body);
    }

    async deleteEntity(){
        this.ctx.body=
            await this.service.entity.deleteEntity(this.ctx.params.entityId,this.ctx.params.id);
    }

    async queryRelevant(){
        this.ctx.body=
            await this.service.entity.queryRelevant(this.ctx.params.entityId,this.ctx.params.monyToMonyId,this.ctx.params.recordId);
    }

    async saveRelevant(){
        this.ctx.body=
            await this.service.entity.saveRelevant(this.ctx.params.entityId,this.ctx.params.monyToMonyId,this.ctx.request.body);
    }
}

module.exports=EntityController;