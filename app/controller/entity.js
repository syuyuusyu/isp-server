const Controller=require('egg').Controller;
const {smartQuery,lowCaseResult,lowCaseResponseBody}=require('../util');

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

    @lowCaseResponseBody
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

        //console.log(entityColumns);
        let foreignColumns=entityColumns.filter(d=>d.foreignKeyId).map(d=>({
            entity:entitys.find(e=>e.id===columns.find(c=>c.id===d.foreignKeyId).entityId),
            thisCol:d,
            idCol:columns.find(c=>c.id===d.foreignKeyId),
            nameCol:columns.find(c=>c.id===d.foreignKeyNameId)
        }));
        //console.log(foreignColumns);
        let values=`select ${entity.entityCode}.*`;
        let tables=` from ${entity.tableName} ${entity.entityCode} `;
        for(let i=0;i<foreignColumns.length;i++){
            let fCol=foreignColumns[i];
            values=values+`,${fCol.entity.entityCode}.${fCol.nameCol.columnName} ${fCol.entity.entityCode}_${fCol.nameCol.columnName}`;
            tables=tables+` join ${fCol.entity.tableName} ${fCol.entity.entityCode} 
                on ${entity.entityCode}.${fCol.thisCol.columnName}=${fCol.entity.entityCode}.${fCol.idCol.columnName}`
        }
        let sql=`${values}${tables} where 1=1`;
        let countSql=`select count(1) total from ${entity.tableName} ${entity.entityCode} where 1=1`;
        let queryValues=[];
        for(let fieldName in this.ctx.request.body){
            if(fieldName==='start' || fieldName==='pageSize' || fieldName==='page') continue;
            if(!entityColumns.find(c=>c.columnName===fieldName)) continue;
            if(entityColumns.find(c=>c.columnName===fieldName).columnType==='timestamp'){
                sql+=` and ${entity.entityCode}.${fieldName} 
                    BETWEEN '${this.ctx.request.body[fieldName][0]}' and '${this.ctx.request.body[fieldName][1]}'`;
                countSql+=` and ${entity.entityCode}.${fieldName} 
                    BETWEEN '${this.ctx.request.body[fieldName][0]}' and '${this.ctx.request.body[fieldName][1]}'`;
                continue;
            }
            if(Object.prototype.toString.call(this.ctx.request.body[fieldName])==="[object Array]"){
                sql+=` and ${entity.entityCode}.${fieldName} in(?)`;
                countSql+=` and ${entity.entityCode}.${fieldName} in(?)`;
            }else{
                sql+=` and ${entity.entityCode}.${fieldName}=?`;
                countSql+=` and ${entity.entityCode}.${fieldName}=?`;
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
        this.ctx.logger.info(sql);
        this.ctx.logger.info(queryValues);
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

    async queryCandidate(){
        const columnId=parseInt(this.ctx.params.columnId);
        const column=this.app.entityCache.columns.find(c=>c.id===columnId);
        let sql=``;
        let queryValues=[];
        if(column.foreignKeyId){
            const fidCol=this.app.entityCache.columns.find(c=>c.id===column.foreignKeyId);
            const fnameCol=this.app.entityCache.columns.find(c=>c.id===column.foreignKeyNameId);
            const entity=this.app.entityCache.entitys.find(e=>e.id===fidCol.entityId);
            sql=`select ${fidCol.columnName} value,${fnameCol.columnName} text from ${entity.tableName} where 1=1`;
            if(this.ctx.request.body[column.columnName]){
                sql=sql+` and ${fidCol.columnName} in(?)`;
                queryValues.push(this.ctx.request.body[column.columnName]);
            }
        }else{
            const entity=this.app.entityCache.entitys.find(e=>e.id===column.entityId);
            const currentColumns=this.app.entityCache.columns.filter(c=>c.entityId===entity.id);
            sql=`select distinct ${column.columnName} value,${column.columnName} text from ${entity.tableName} where 1=1`;
            for(let key in this.ctx.request.body){
                if(!currentColumns.find(c=>c.columnName===key)) continue;
                sql=sql+` and ${key} in(?)`;
                queryValues.push(this.ctx.request.body[key]);
            }
        }
        this.ctx.logger.info(sql,queryValues);
        this.ctx.body=await this.app.mysql.query(sql,queryValues);
    }

    async checkUnique(){
        const entity=this.app.entityCache.entitys.find(e=>e.id==this.ctx.params.entityId);
        let sql=`select count(${this.ctx.params.checkField}) total from ${entity.tableName} where 
            ${this.ctx.params.checkField}=?`;
        if(entity.deleteFlagField){
            sql=sql+` and ${entity.deleteFlagField}=1`;
        }
        let [result]=await this.app.mysql.query(sql,[this.ctx.params.value]);
        this.ctx.body=result;
    }

    async saveEntity(){
        const requestBody=this.ctx.request.body;
        const entity=this.app.entityCache.entitys.find(e=>e.id==this.ctx.params.entityId);
        let result = await this.app.mysql[requestBody[entity.idField]?'update':'insert'](entity.tableName, requestBody);
        // 判断更新成功
        const updateSuccess = result.affectedRows === 1;
        this.ctx.body={success:updateSuccess};
    }

    async deleteEntity(){
        const entity=this.app.entityCache.entitys.find(e=>e.id==this.ctx.params.entityId);
        let id=this.ctx.params.id;
        if(entity.parentEntityId && entity.parentEntityId===entity.id){
            //id,idField,pidField,tableName
            id=await this.ctx.service.saveOrDelete.childList(id,entity.idField,entity.pidField,entity.tableName);
        }
        let result;
        console.log(id);
        if(entity.deleteFlagField){
            result= await this.app.mysql.update(entity.tableName, {
                [entity.idField]:id,
                [entity.deleteFlagField]:0
            });
        }else{
            result = await this.app.mysql.delete(entity.tableName, {
                [entity.idField]:id,
            });
        }
        console.log(result);
        const updateSuccess = result.affectedRows>0;
        console.log(updateSuccess);
        this.ctx.body={success:updateSuccess};
    }
}

module.exports=EntityController;