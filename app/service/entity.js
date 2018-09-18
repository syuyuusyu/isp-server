const Service=require('egg').Service;
const {smartQuery,lowCaseResult}=require('../util');

class EntityService extends Service{

    async entityCache() {
        const entityCache = {};
        entityCache.columns = await this.app.mysql.query(`select * from entity_column order by id,columnIndex`);
        entityCache.entitys = await this.app.mysql.query(`select * from entity`);
        entityCache.dictionary = await this.app.mysql.query(`select * from entity_dictionary order by groupId`);
        entityCache.monyToMony = await this.app.mysql.query(`select * from entity_mony_to_mony`);
        this.app.messenger.sendToAgent('entityCache',entityCache);

    }

    relevantInfo(entityId,monyToMonyId){
        const entity=this.app.entityCache.entitys.find(e=>e.id==entityId);
        const monyToMony=this.app.entityCache.monyToMony.find(m=>m.id==monyToMonyId);
        let srcTableName=entity.tableName,
            srcIdField=entity.idField,
            relevantTableName=monyToMony.relationTable,
            destTableName,
            destIdField,
            r_srcIdField,
            r_destIdField,
            relevantEntity,
            isFirst;
        if(monyToMony.firstTable===entity.tableName){
            isFirst=false;
            relevantEntity=this.app.entityCache.entitys.find(e=>e.tableName===monyToMony.secondTable);
        }else if(monyToMony.secondTable===entity.tableName){
            isFirst=true;
            relevantEntity=this.app.entityCache.entitys.find(e=>e.tableName===monyToMony.firstTable);
        }
        if(!relevantEntity){
            return {success:false};
        }
        if(isFirst){
            r_srcIdField=monyToMony.secondIdField;
            r_destIdField=monyToMony.firstIdField;
        }else{
            r_srcIdField=monyToMony.firstIdField;
            r_destIdField=monyToMony.secondIdField;
        }
        destTableName=relevantEntity.tableName;
        destIdField=relevantEntity.idField;
        return {
            success:true,
            srcTableName:srcTableName,
            srcIdField:srcIdField,
            relevantTableName:relevantTableName,
            targetTableName:destTableName,
            targetIdField:destIdField,
            r_srcIdField:r_srcIdField,
            r_targetIdField:r_destIdField,
            targetDeleteFlagField:relevantEntity.deleteFlagField
        }


    }

    @smartQuery
    async columns(entityId){
        return await this.app.mysql.query(
            `select * from entity_column where entityId=? order by id,columnIndex`,[entityId]);
    }

    @smartQuery
    async entityOperations(entityId){
        return await this.app.mysql.query(`select * from entity_operation where entityId=?`,[entityId]);
    };

    async entitys(){
        return await this.app.mysql.query(
            `select * from entity`,[]
        );
    }

    async saveConfig(entity,tableName,idField){
        let result = await this.app.mysql[entity[idField]?'update':'insert'](tableName, entity);
        // 判断更新成功
        const updateSuccess = result.affectedRows === 1;
        this.entityCache();
        return {success:updateSuccess};

    }

    async deleteConfig(tableName,idField,id){
        const result = await this.app.mysql.delete(tableName, {
            [idField]: id
        });
        const updateSuccess = result.affectedRows === 1;
        this.entityCache();
        return {success:updateSuccess};
    }

    @smartQuery
    async query(entityId,requestBody){
        const {entitys,columns}=this.app.entityCache;
        let entity=entitys.filter(e=>e.id==entityId)[0];
        let entityColumns=columns.filter(c=>c.entityId==entityId);
        if(!entity || entityColumns.length===0){
            return {
                success:false
            };

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
        for(let fieldName in requestBody){
            if(fieldName==='start' || fieldName==='pageSize' || fieldName==='page') continue;
            if(!entityColumns.find(c=>c.columnName===fieldName)) continue;
            if(entityColumns.find(c=>c.columnName===fieldName).columnType==='timestamp'){
                sql+=` and ${entity.entityCode}.${fieldName} 
                    BETWEEN '${requestBody[fieldName][0]}' and '${requestBody[fieldName][1]}'`;
                countSql+=` and ${entity.entityCode}.${fieldName} 
                    BETWEEN '${requestBody[fieldName][0]}' and '${requestBody[fieldName][1]}'`;
                continue;
            }
            if(Object.prototype.toString.call(requestBody[fieldName])==="[object Array]"){
                sql+=` and ${entity.entityCode}.${fieldName} in(?)`;
                countSql+=` and ${entity.entityCode}.${fieldName} in(?)`;
            }else{
                sql+=` and ${entity.entityCode}.${fieldName}=?`;
                countSql+=` and ${entity.entityCode}.${fieldName}=?`;
            }
            queryValues.push(requestBody[fieldName]?requestBody[fieldName]:null);
        }
        if(entity.deleteFlagField){
            sql+=` and ${entity.entityCode}.${entity.deleteFlagField}='1'`;
            countSql+=` and ${entity.entityCode}.${entity.deleteFlagField}='1'`;
        }
        let pageQuery=false;
        let [{total}]=await this.app.mysql.query(countSql,queryValues);
        const {start,pageSize}=requestBody;
        if((start || start===0) && pageSize){
            sql+=` limit ${start},${pageSize};`;
            pageQuery=true;
        }
        this.ctx.logger.info(sql);
        this.ctx.logger.info(queryValues);
        let data=await this.app.mysql.query(sql,queryValues);
        return {
            success:true,
            pageQuery,
            total,
            data
        };
    }

    async topParentRecord(entityId){
        const {entitys}=this.app.entityCache;
        let entity=entitys.filter(e=>e.id==entityId)[0];
        if(!entity || !entity.parentEntityId || entity.parentEntityId!=entity.id){
            return null;
        }
        let [result]=await this.app.mysql.query(
            `select * from ${entity.tableName} where ${entity.pidField} not in(select ${entity.idField} from ${entity.tableName} )`);
        return result;
    }

    async queryCandidate(columnId,requestBody){
        //const columnId=parseInt(this.ctx.params.columnId);
        const column=this.app.entityCache.columns.find(c=>c.id===columnId);
        let sql=``;
        let queryValues=[];
        if(column.foreignKeyId){
            const fidCol=this.app.entityCache.columns.find(c=>c.id===column.foreignKeyId);
            const fnameCol=this.app.entityCache.columns.find(c=>c.id===column.foreignKeyNameId);
            const entity=this.app.entityCache.entitys.find(e=>e.id===fidCol.entityId);
            sql=`select ${fidCol.columnName} value,${fnameCol.columnName} text from ${entity.tableName} where 1=1`;
            if(requestBody[column.columnName]){
                sql=sql+` and ${fidCol.columnName} in(?)`;
                queryValues.push(requestBody[column.columnName]);
            }
        }else{
            const entity=this.app.entityCache.entitys.find(e=>e.id===column.entityId);
            const currentColumns=this.app.entityCache.columns.filter(c=>c.entityId===entity.id);
            sql=`select distinct ${column.columnName} value,${column.columnName} text from ${entity.tableName} where 1=1`;
            for(let key in requestBody){
                if(!currentColumns.find(c=>c.columnName===key)) continue;
                sql=sql+` and ${key} in(?)`;
                queryValues.push(requestBody[key]);
            }
        }
        this.ctx.logger.info(sql,queryValues);
        return await this.app.mysql.query(sql,queryValues);
    }

    async checkUnique(entityId,checkField,value){
        const entity=this.app.entityCache.entitys.find(e=>e.id==entityId);
        let sql=`select count(${checkField}) total from ${entity.tableName} where 
            ${checkField}=?`;
        if(entity.deleteFlagField){
            sql=sql+` and ${entity.deleteFlagField}=1`;
        }
        let [result]=await this.app.mysql.query(sql,[value]);
        return result;
    }

    async saveEntity(entityId,requestBody){
        const entity=this.app.entityCache.entitys.find(e=>e.id==entityId);
        let result = await this.app.mysql[requestBody[entity.idField]?'update':'insert'](entity.tableName, requestBody);
        // 判断更新成功
        const updateSuccess = result.affectedRows === 1;
        return {success:updateSuccess};
    }

    async deleteEntity(entityId,id){
        const entity=this.app.entityCache.entitys.find(e=>e.id==entityId);
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
        return {success:updateSuccess};
    }

    async queryRelevant(entityId,monyToMonyId,recordId){
        const {success,srcTableName,srcIdField,
            relevantTableName,targetTableName,
            targetIdField,r_srcIdField,
            r_targetIdField,targetDeleteFlagField}
            =this.relevantInfo(entityId,monyToMonyId);
        if(!success){
            return {success};
        }
        let sql=`select f.* from ${targetTableName} f 
            join ${relevantTableName} m on m.${r_targetIdField}=f.${targetIdField}
            join ${srcTableName} s on m.${r_srcIdField}=s.${srcIdField} where s.${srcIdField}=?`;
        if(targetDeleteFlagField){
            sql=sql+` and f.${targetDeleteFlagField}='1'`
        }
        this.ctx.logger.info(sql);
        let result=await this.app.mysql.query(sql,[recordId]);
        return {
            success,
            data:result
        }
    }

    async saveRelevant(entityId,monyToMonyId,requestBody){
        const {relevantTableName, r_srcIdField, r_targetIdField}
            =this.relevantInfo(entityId,monyToMonyId);
        const {srcId,targetIds}=requestBody;
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
        return {success:updateSuccess};
    }

}


module.exports = EntityService;