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
        this.ctx.body=await this.service.entity.saveConfig(this.ctx.request.body,this.ctx.params.tableName,this.ctx.params.idField);
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
        if(entity.deleteFlagField){
            sql+=` and ${entity.entityCode}.${entity.deleteFlagField}='1'`;
            countSql+=` and ${entity.entityCode}.${entity.deleteFlagField}='1'`;
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

    async topParentRecord(){
        const entityId=this.ctx.params.entityId;
        const {entitys}=this.app.entityCache;
        let entity=entitys.filter(e=>e.id==entityId)[0];
        if(!entity || !entity.parentEntityId || entity.parentEntityId!=entity.id){
            this.ctx.body={};
            return;
        }
        let [result]=await this.app.mysql.query(
            `select * from ${entity.tableName} where ${entity.pidField} not in(select ${entity.idField} from ${entity.tableName} )`);
        this.ctx.body=result;
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
        const updateSuccess = result.affectedRows>0;
        console.log(updateSuccess);
        this.ctx.body={success:updateSuccess};
    }

    async queryRelevant(){
        const {success,srcTableName,srcIdField,
            relevantTableName,targetTableName,
            targetIdField,r_srcIdField,
            r_targetIdField,targetDeleteFlagField}
                =this.ctx.service.entity.relevantInfo(this.ctx.params.entityId,this.ctx.params.monyToMonyId);
        if(!success){
            this.ctx.body={success};
            return;
        }
        let sql=`select f.* from ${targetTableName} f 
            join ${relevantTableName} m on m.${r_targetIdField}=f.${targetIdField}
            join ${srcTableName} s on m.${r_srcIdField}=s.${srcIdField} where s.${srcIdField}=?`;
        if(targetDeleteFlagField){
            sql=sql+` and f.${targetDeleteFlagField}='1'`
        }
        this.ctx.logger.info(sql);
        let result=await this.app.mysql.query(sql,[this.ctx.params.recordId]);
        this.ctx.body={
            success,
            data:result
        }
    }

    async saveRelevant(){
        const {relevantTableName, r_srcIdField, r_targetIdField}
                =this.ctx.service.entity.relevantInfo(this.ctx.params.entityId,this.ctx.params.monyToMonyId);
        const {srcId,targetIds}=this.ctx.request.body;
        console.log(relevantTableName, r_srcIdField, r_targetIdField);
        console.log(targetIds);
        let result;
        const conn = await this.app.mysql.beginTransaction(); // 初始化事务

        try {
            await conn.delete(relevantTableName, {
                [r_srcIdField]: srcId,
            });  // 第一步操作
            if(targetIds.length>0){
                let sql=`insert into ${relevantTableName}(${r_srcIdField},${r_targetIdField}) 
                    values ${targetIds.map((a)=>'('+srcId+','+a+')').reduce((a,b)=>a+','+b)}`;
                console.log(sql);
                result=await conn.query(sql);  // 第二步操作
            }

            await conn.commit(); // 提交事务
        } catch (err) {
            await conn.rollback(); // 一定记得捕获异常后回滚事务！！
            throw err;
        }
        const updateSuccess = targetIds.length===0 || result.affectedRows === targetIds.length;
        this.ctx.body={success:updateSuccess};
    }
}

module.exports=EntityController;