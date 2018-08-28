const Controller=require('egg').Controller;
const {smartQuery}=require('../util');

class EntityController extends Controller{

    @smartQuery
    async columns(){
        let result=await this.app.mysql.query(
            `select * from entity_column where entityId=? order by id,columnIndex`,[parseInt(this.ctx.params.entityId)]);
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
        this.ctx.service.entity.entityCache();
    }

    async deleteConfig(){
        const result = await this.app.mysql.delete(this.ctx.params.tableName, {
            [this.ctx.params.idField]: this.ctx.params.id
        });
        const updateSuccess = result.affectedRows === 1;
        this.ctx.body={success:updateSuccess};
        this.ctx.service.entity.entityCache();
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

    @smartQuery
    async query(){
        const entityId=this.ctx.params.entityId;
        const {entitys,columns}=this.app.entityCache;
        let entity=entitys.filter(e=>e.id==entityId)[0];
        let entityColumns=columns.filter(c=>c.entityId==entityId);
        if(!entity || entityColumns.length===0){
            this.ctx.body={
               success:false
            };
            return;
        }
        let sql=`select * from ${entity.tableName} where 1=1`;
        let countSql=`select count(1) total from ${entity.tableName} where 1=1`;
        let queryValues=[];
        for(let fieldName in this.ctx.request.body){
            if(fieldName==='start' || fieldName==='pageSize' || fieldName==='page') continue;
            if(Object.prototype.toString.call(this.ctx.request.body[fieldName])==="[object Array]"){
                sql+=` and ${fieldName} in(?)`;
                countSql+=` and ${fieldName} in(?)`
            }else{
                sql+=` and ${fieldName}=?`;
                countSql+=` and ${fieldName}=?`
            }
            queryValues.push(this.ctx.request.body[fieldName]?this.ctx.request.body[fieldName]:null);
        }

        let pageQuery=false;
        let [{total}]=await this.app.mysql.query(countSql,queryValues);
        const {start,pageSize}=this.ctx.request.body;
        if((start || start===0) && pageSize){
            sql+=` limit ${start},${pageSize};`;
            pageQuery=true;
        }
        let data=await this.app.mysql.query(sql,queryValues);
        this.ctx.body={
            success:true,
            pageQuery,
            total,
            data
        };
    }

    async topParentId(){
        const entityId=this.ctx.params.entityId;
        const {entitys}=this.app.entityCache;
        let entity=entitys.filter(e=>e.id==entityId)[0];
        if(!entity || !entity.parentEntityId || entity.parentEntityId!=entity.id){
            this.ctx.body={topParentId:null};
            return;
        }
        let [{id}]=await this.app.mysql.query(
            `select ${entity.idField} id from ${entity.tableName} where ${entity.pidField} not in(select ${entity.idField} from ${entity.tableName} )`);
        this.ctx.body={topParentId:id};
    }
}

module.exports=EntityController;