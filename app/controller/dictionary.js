const Controller=require('egg').Controller;
const {smartQuery}=require('../util');

class DictionaryController extends Controller{

    async allDictionary(){
        this.ctx.body=await this.app.mysql.query(`select DISTINCT groupId,groupName from entity_dictionary`,[]);
    }

    @smartQuery
    async dictionary(){
        this.ctx.logger.info(this.app.mysql.modify);
        this.ctx.body=await this.app.mysql.query(`select id,groupId,groupName,text,value from entity_dictionary where groupId=?`,
            [parseInt(this.ctx.params.dicGroupId)]);
    }

    async saveDic(){
        this.ctx.logger.info(this.app.mysql.modify);
        let {groupId,groupName}=this.ctx.request.body;
        let affectedRows=0;
        if(groupId){
            let result=await this.app.mysql.query(`UPDATE  entity_dictionary set groupName=? where groupId=?`,[groupName,groupId]);
            affectedRows=result.affectedRows;
        }else{
            let [{groupId:currentGroupId}]=await this.app.mysql.query(`select max(groupId)+1 groupId from entity_dictionary`);
            groupId=currentGroupId;
            let result=await this.app.mysql.query(`insert into entity_dictionary (groupId,groupName) values(?,?)`,[groupId,groupName]);
            affectedRows=result.affectedRows;
        }
        const updateSuccess = affectedRows >0;
        this.ctx.body={success:updateSuccess};
    }

    async saveDicField(){
        this.ctx.logger.info(this.app.mysql.modify);
        let {id,groupId,groupName,text,value}=this.ctx.request.body;
        let affectedRows=0;
        if(id){
            let result = await this.app.mysql.update('entity_dictionary', this.ctx.request.body);
            affectedRows= result.affectedRows;
        }else{
            let isnewDic=await this.app.mysql.query(`select id from entity_dictionary where groupId=? and value=''`,[groupId]);
            if(isnewDic.length>0){
                let result = await this.app.mysql.update('entity_dictionary', {...this.ctx.request.body,id:isnewDic[0].id});
                affectedRows= result.affectedRows;
            }else{
                let result=await this.app.mysql.query(`insert into entity_dictionary (id,groupId,groupName,text,value)
                    values(null,?,?,?,?)`,[groupId,groupName,text,value]);
                affectedRows=result.affectedRows;
            }
        }
        const updateSuccess = affectedRows >0;
        this.ctx.body={success:updateSuccess};
    }

    async deleteGroup(){
        let result=await this.app.mysql.query(`delete from  entity_dictionary where groupId=?`,[this.ctx.params.groupId]);
        const updateSuccess = result.affectedRows >0;
        this.ctx.body={success:updateSuccess};
    }

    async deleteDictionary(){
        let result=await this.app.mysql.query(`delete from  entity_dictionary where id=?`,[this.ctx.params.id]);
        const updateSuccess = result.affectedRows >0;
        this.ctx.body={success:updateSuccess};
    }
}


module.exports=DictionaryController;
