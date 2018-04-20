const Controller=require('egg').Controller;

class MenuController extends Controller{

    constructor(){
        super(...arguments);

        this.roleMenuSql=
            'select distinct m.* from isp_menu m join isp_role_menu rm on rm.menu_id=m.id where m.parent_id=? and rm.role_id in (?) order by m.id';
    }



    async currentMenu(){
        let sql=`select m.* from isp_menu m join isp_role_menu rm on rm.menu_id=m.id where m.parent_id=? and rm.role_id in (?) order by m.id`;
        let token=this.ctx.request.header['access-token'];
        let sd=await this.service.authorService.getAuthor(token);
        let result=[];
        if(sd.roles.length>0){
            result=await this.app.mysql.query(sql,[this.ctx.params.parentId,sd.roles.map(r=>r.id)]);
        }
        this.ctx.body=result;
    }

    async currentRoleMenu(){
        let sql=`select m.* from isp_menu m join isp_role_menu rm on rm.menu_id=m.id where rm.role_id in (?) order by m.id`;
        let token=this.ctx.request.header['access-token'];
        let sd=await this.service.authorService.getAuthor(token);
        let result=await this.app.mysql.query(sql,[sd.roles.map(r=>r.id)]);
        this.ctx.body=result;
    }

    async menuTree() {
        const token =this.ctx.request.header['access-token'];
        const {roles}=await this.service.authorService.getAuthor(token);
        let tree=[];
        if(roles.length>0){
            tree=await this.app.mysql.query(this.roleMenuSql,[1,roles.map(r=>r.id)]);
            await this._menuTree(tree,roles);
        }
        this.ctx.body=tree;
    }

    async _menuTree(tree,roles){

        for(let i=0;i<tree.length;i++){
            const current=await this.app.mysql.query(this.roleMenuSql,[tree[i].id,roles.map(r=>r.id)]);
            if(current && current.length>0){
                tree[i].children=current;
                await this._menuTree(tree[i].children,roles);
            }else if(tree[i].load_method){
                let method=tree[i].load_method.split('.');
                tree[i].children=await this.service[method[0]][method[1]](tree[i],roles);
                //tree[i].children=await this.service.operation.loadPlatfrom(tree[i],roles);
            }
        }
    }



}

module.exports=MenuController;
