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
        console.log(monyToMony,monyToMonyId);
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
        console.log({
            success:true,
            srcTableName:srcTableName,
            srcIdField:srcIdField,
            relevantTableName:relevantTableName,
            targetTableName:destTableName,
            targetIdField:destIdField,
            r_srcIdField:r_srcIdField,
            r_targetIdField:r_destIdField,
            targetDeleteFlagField:relevantEntity.deleteFlagField
        });
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

}


module.exports = EntityService;