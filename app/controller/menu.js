const Controller=require('egg').Controller;

class MenuController extends Controller{
    async currentMenu(){
        this.ctx.body=await this.app.mysql.select('menu',{
            where:{
                parent_id:this.ctx.params.parentId
            }
        });

    }

    test(){
        this.ctx.body={a:1};
    }
}

module.exports=MenuController;