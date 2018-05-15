const Controller=require('egg').Controller;

class DictionaryController extends Controller{

    async getDictionary(){
        let result=await this.app.mysql.query(`select * from t_dictionary where group_id=? and stateflag=1`,[this.ctx.params.groupId]);
        this.ctx.body=result;
    }
}


module.exports=DictionaryController;