const Service = require('egg').Service;

class SaveOrDelete extends Service {

    async save(tableName, entity) {
        console.log('----save---');
        console.log(entity);
        const authorToken = this.ctx.request.header['access-token'];
        let {user} = await this.ctx.service.authorService.getByCode(authorToken);
        if(!authorToken || !user){
            return false;
        }
        let result = {};
        if (entity.id) {
            result = await this.app.mysql.update(tableName, {
                ...entity,
                update_by: user.user_name,
                update_time: new Date()
            });
        } else {
            result = await this.app.mysql.insert(tableName, {
                ...entity,
                create_time:new Date(),
                create_by:user.user_name,
                stateflag:1
            });
        }

        return result.affectedRows === 1;
    }

    async delete(table_name,id){
        const authorToken = this.ctx.request.header['access-token'];
        let {user} = await this.ctx.service.authorService.getByCode(authorToken);
        if(!authorToken || !user){
            return false;
        }
        let [entity]=await this.app.mysql.query(`select *  from ${table_name} where id=?`, [id]);
        if(!entity){
            return false
        }
        let result= await this.app.mysql.update(table_name, {
            ...entity,
            update_by: user.user_name,
            update_time: new Date(),
            stateflag:0
        });
        return result.affectedRows === 1;
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


module.exports = SaveOrDelete;
