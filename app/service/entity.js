const Service=require('egg').Service;
const {smartQuery,lowCaseResult}=require('../util');

class EntityService extends Service{

    async entityCache() {
        const entityCache = {};
        entityCache.columns = await this.app.mysql.query(`select * from entity_column order by id,columnIndex`);
        entityCache.entitys = await this.app.mysql.query(`select * from entity`);
        entityCache.dictionary = await this.app.mysql.query(`select * from entity_dictionary order by groupId`);
        entityCache.monyToMony = await this.app.mysql.query(`select * from entity_mony_to_mony`);
        console.log(111111);

        this.app.messenger.sendToAgent('entityCache',entityCache);

    }

    @lowCaseResult
    async test(){
        let result=await this.app.mysql.query(`select id ID,tableName TABLENAME from entity`);
        return result;
    }

}


module.exports = EntityService;