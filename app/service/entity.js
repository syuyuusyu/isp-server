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
        console.log(entityId,requestBody);
        const {entitys,columns,monyToMony}=this.app.entityCache;
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
        let values=`select ${entity.entityCode}.*`;
        let tables=` from ${entity.tableName} ${entity.entityCode} `;
        for(let i=0;i<foreignColumns.length;i++){
            let fCol=foreignColumns[i];
            values=values+`,${fCol.entity.entityCode}.${fCol.nameCol.columnName} ${fCol.entity.entityCode}_${fCol.nameCol.columnName}`;
            tables=tables+` left join ${fCol.entity.tableName} ${fCol.entity.entityCode} 
                on ${entity.entityCode}.${fCol.thisCol.columnName}=${fCol.entity.entityCode}.${fCol.idCol.columnName}`;
            //当外键对应表为树结构时查询树节点下所有的ID
            let fEntity=foreignColumns[i].entity;
            if(fEntity.parentEntityId && fEntity.id==fEntity.parentEntityId){
                if(requestBody[fCol.thisCol.columnName]){
                    let ids=await this.childList(requestBody[fCol.thisCol.columnName],fEntity.idField,fEntity.pidField,fEntity.tableName);
                    requestBody[fCol.thisCol.columnName]=ids;
                }
            }
        }
        for(let key in requestBody) {
            if (key.startsWith('mm')) {
                let eId, mmId;
                key.replace(/^mm_(\d+)_(\d+)$/,(w,p1,p2)=>{eId=p1,mmId=p2});
                let en=entitys.filter(e=>e.id==eId)[0];
                let mm=monyToMony.find(m=>m.id==mmId);
                let fidField=mm.firstTable==entity.tableName?mm.firstIdField:mm.secondIdField;
                let sidField=mm.firstTable==en.tableName?mm.firstIdField:mm.secondIdField;
                tables+=` join ${mm.relationTable} ${mm.relationTable} on ${mm.relationTable}.${fidField}=${entity.entityCode}.${entity.idField}`
            }
        }
        let sql=`${values}${tables} where 1=1`;
        let countSql=`select count(1) total ${tables} where 1=1`;
        let queryValues=[];
        for(let fieldName in requestBody){
            if(fieldName==='start' || fieldName==='pageSize' || fieldName==='page') continue;
            let opdic={
                uneq_:'<>',
                gt_:'>',
                lt_:'<',
                null_:' is null',
                notnull_:' is not null'
            };
            let op='=';
            let prefix='';
            ['uneq_','gt_','lt_','null_','notnull_'].forEach(_=>{
                if(fieldName.startsWith(_)){
                    fieldName=fieldName.replace(_,'');
                    op=opdic[_];
                    prefix=_;
                }
            });
            if(fieldName.startsWith('fuzzy_')){
                let fname=fieldName.replace(/^fuzzy_(\w+)/,"$1");
                if(!entityColumns.find(c=>c.columnName===fname)) continue;
                sql+=` and ${entity.entityCode}.${fname} like '%${requestBody[fieldName]}%'`;
                countSql+=` and ${entity.entityCode}.${fname} like '%${requestBody[fieldName]}%'`;
            }
            if(!entityColumns.find(c=>c.columnName===fieldName)) continue;
            if(entityColumns.find(c=>c.columnName===fieldName).columnType==='timestamp'){
                sql+=` and ${entity.entityCode}.${fieldName} 
                    BETWEEN '${requestBody[fieldName][0]}' and '${requestBody[fieldName][1]}'`;
                countSql+=` and ${entity.entityCode}.${fieldName} 
                    BETWEEN '${requestBody[fieldName][0]}' and '${requestBody[fieldName][1]}'`;
                continue;
            }
            if(Object.prototype.toString.call(requestBody[fieldName])==="[object Array]"){
                sql+=` and ${entity.entityCode}.${fieldName} ${op=='='?'in':'not in'}(?)`;
                countSql+=` and ${entity.entityCode}.${fieldName} ${op=='='?'in':'not in'}(?)`;
            }else{
                sql+=` and ${entity.entityCode}.${fieldName}${op}${(prefix=='null_' || prefix=='notnull_')?'':'?'}`;
                countSql+=` and ${entity.entityCode}.${fieldName}${op}${(prefix=='null_' || prefix=='notnull_')?'':'?'}`;
            }
            if(prefix=='null_' || prefix=='notnull_') continue;
            queryValues.push(requestBody[prefix+fieldName]?requestBody[prefix+fieldName]:null);
        }

        if(entity.deleteFlagField){
            sql+=` and ${entity.entityCode}.${entity.deleteFlagField}='1'`;
            countSql+=` and ${entity.entityCode}.${entity.deleteFlagField}='1'`;
        }
        for(let key in requestBody) {
            if (key.startsWith('mm')) {
                let eId, mmId;
                key.replace(/^mm_(\d+)_(\d+)$/,(w,p1,p2)=>{eId=p1,mmId=p2});
                let en=entitys.filter(e=>e.id==eId)[0];
                let mm=monyToMony.find(m=>m.id==mmId);
                let fidField=mm.firstTable==entity.tableName?mm.firstIdField:mm.secondIdField;
                let sidField=mm.firstTable==en.tableName?mm.firstIdField:mm.secondIdField;
                sql+=` and ${mm.relationTable}.${sidField}=${requestBody[key]}`;
                countSql+=` and ${mm.relationTable}.${sidField}=${requestBody[key]}`
            }
        }
        if(entity.orderField){
            sql+=` order by `;
            entity.orderField.split(',').forEach(key=>{
                sql+=` ${entity.entityCode}.${key}`;
            });
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
        this.ctx.logger.info(requestBody);
        const column=this.app.entityCache.columns.find(c=>c.id===columnId);
        let sql=``;
        let queryValues=[];
        let entityColumns=[];
        let entity;
        let numKey=(columns,body)=>{
            for(let key in body){
                if(/\d+/.test(key)){
                    let col=columns.find(c=>c.id==key)
                    if(col){
                        body[col.columnName]=body[key];
                    }
                    delete body[key];
                }
            }
        };
        if(column.foreignKeyId){
            const fidCol=this.app.entityCache.columns.find(c=>c.id===column.foreignKeyId);
            const fnameCol=this.app.entityCache.columns.find(c=>c.id===column.foreignKeyNameId);
            entity=this.app.entityCache.entitys.find(e=>e.id===fidCol.entityId);
            entityColumns=this.app.entityCache.columns.filter(c=>c.entityId===entity.id);
            numKey(entityColumns,requestBody);
            sql=`select ${fidCol.columnName} value,${fnameCol.columnName} text from ${entity.tableName} ${entity.entityCode} where 1=1`;
            for(let fieldName in requestBody){
                if(fieldName.endsWith(column.columnName)){
                    let newName=fieldName.replace(/(uneq_|gt_|lt_|null_|notnull_)(?:\w+)/,(w,p)=>p+fidCol.columnName);
                    requestBody[newName]=requestBody[fieldName];
                    delete requestBody[fieldName];
                }
            }
        }else{
            entity=this.app.entityCache.entitys.find(e=>e.id===column.entityId);
            entityColumns=this.app.entityCache.columns.filter(c=>c.entityId===entity.id);
            numKey(entityColumns,requestBody);
            sql=`select distinct ${column.columnName} value,${column.columnName} text from ${entity.tableName} ${entity.entityCode} where 1=1`;
        }
        for(let fieldName in requestBody){
            if(fieldName==='start' || fieldName==='pageSize' || fieldName==='page') continue;
            let opdic={
                uneq_:'<>',
                gt_:'>',
                lt_:'<',
                null_:' is null',
                notnull_:' is not null'
            };
            let op='=';
            let prefix='';
            ['uneq_','gt_','lt_','null_','notnull_'].forEach(_=>{
                if(fieldName.startsWith(_)){
                    fieldName=fieldName.replace(_,'');
                    op=opdic[_];
                    prefix=_;
                }
            });
            let currentColumn=entityColumns.find(c=>c.columnName===fieldName);
            if(!currentColumn) continue;
            if(currentColumn.foreignKeyId){
                const fidCol=this.app.entityCache.columns.find(c=>c.id===currentColumn.foreignKeyId);
                const fentity=this.app.entityCache.entitys.find(e=>e.id===fidCol.entityId);
                if(fentity.parentEntityId && fentity.id==fentity.parentEntityId){
                    //id,idField,pidField,tableName
                    const ids=await this.childList(requestBody[fieldName],fentity.idField,fentity.pidField,fentity.tableName);
                    requestBody[fieldName]=ids;
                }
            }
            if(currentColumn.columnType==='timestamp'){
                sql+=` and ${entity.entityCode}.${fieldName} 
                    BETWEEN '${requestBody[fieldName][0]}' and '${requestBody[fieldName][1]}'`;
                continue;
            }
            if(Object.prototype.toString.call(requestBody[fieldName])==="[object Array]"){
                sql+=` and ${entity.entityCode}.${fieldName} ${op=='='?'in':'not in'}(?)`;
            }else{
                sql+=` and ${entity.entityCode}.${fieldName}${op}${(prefix=='null_' || prefix=='notnull_')?'':'?'}`;
            }
            if(prefix=='null_' || prefix=='notnull_') continue;
            queryValues.push(requestBody[prefix+fieldName]?requestBody[prefix+fieldName]:null);
        }
        if(entity.deleteFlagField){
            sql+=` and ${entity.entityCode}.${entity.deleteFlagField}='1'`;
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
            id=await this.childList(id,entity.idField,entity.pidField,entity.tableName);
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
        this.ctx.logger.info(sql,[recordId]);
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
        //对入库后的缓存进行刷新
        if (updateSuccess){
            console.log(entityId,monyToMonyId);
            if ((entityId == 1003 || entityId == 1039) && monyToMonyId ==19){
                //接口调用权限
                await this.service.authorService.invokePromiss();
            }
            if ((entityId == 1000 || entityId == 1001) && monyToMonyId ==11){
                //用户角色
                this.service.authorService.actSynUser();
            }
        }
        return {success:updateSuccess};
    }

    async childList(id,idField,pidField,tableName){
        const result=[id];
        const sql=`select ${idField} id from ${tableName} where ${pidField} in(?)`;
        await this._child([id],result,sql);
        return result;
    }

    async _child(currentIds,result,sql){
        const ids =await this.app.mysql.query(sql,[currentIds]);
        if(ids.length>0){
            ids.forEach(_=>result.push(_.id));
            await this._child(ids.map(o=>o.id),result,sql);
        }
    }

}


module.exports = EntityService;