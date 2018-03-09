const Controller=require('egg').Controller;

class MenuController extends Controller{
    async currentMenu(){
        console.log('currentMenu');
        let sql=`select m.* from isp_menu m join isp_role_menu rm on rm.menu_id=m.id where m.parent_id=? and rm.role_id in (?) order by m.id`;
        let token=this.ctx.request.header['access-token'];
        let sd=await this.service.authorService.getAuthor(token);
        let result=await this.app.mysql.query(sql,[this.ctx.params.parentId,sd.roles.map(r=>r.id)]);
        this.ctx.body=result;

    }



}

module.exports=MenuController;