const Service=require('egg').Service;

class EntityService extends Service{

    async entityCache() {
        const entityCache = {};
        entityCache.columns = await this.app.mysql.query(`select * from entity_column order by id,columnIndex`);
        entityCache.entitys = await this.app.mysql.query(`select * from entity`);
        entityCache.dictionary = await this.app.mysql.query(`select * from entity_dictionary order by groupId`);
        entityCache.monyToMony = await this.app.mysql.query(`select * from entity_mony_to_mony`);
        this.app.messenger.sendToAgent('entityCache',entityCache);
    }

}


module.exports = EntityService;