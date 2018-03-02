const Controller=require('egg').Controller;

class MenuController extends Controller{
    async currentMenu(){
        const roleMenuId=this.ctx.session.roleMenuId;
        console.log(this.ctx.session);
        this.ctx.body=await this.app.mysql.select('isp_menu',{
            where:{
                parent_id:this.ctx.params.parentId
            }
        });

    }

}

module.exports=MenuController;