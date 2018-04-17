const Service=require('egg').Service;

class MessageService extends Service{

    async save(entity){
        let result={};
        if(entity.id){
            result = await this.app.mysql.update('isp_message', entity);
        }else {
            result = await this.app.mysql.insert('isp_message', entity); // 更新 posts 表中的记录
        }
        return  result.affectedRows === 1;
    }

    async setComplete(entity){
        return await this.save({...entity,step:2})
    }
}


module.exports = MessageService;