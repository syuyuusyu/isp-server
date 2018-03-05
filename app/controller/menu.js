const Controller=require('egg').Controller;

class MenuController extends Controller{
    async currentMenu(){
        console.log('currentMenu');
        let result= await this.app.mysql.select('isp_menu',{
            where:{
                parent_id:this.ctx.params.parentId
            }
        });
        //console.log(result);
        this.ctx.body=result;

    }

}

module.exports=MenuController;