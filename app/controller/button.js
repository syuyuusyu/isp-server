const Controller=require('egg').Controller;

class ButtonController extends Controller{
    async menuButton(){
        let buttons=await this.app.mysql.select('t_button',{
            where:{menu_id:this.ctx.params.menuId,stateflag:1}
        });
        this.ctx.body=buttons;
    }

    async buttonRole(){
        let roles=await this.app.mysql.query(`select r.* from t_role_button r where r.role_id=? and stateflag=1`,
            [this.ctx.params.roleId]);
        this.ctx.body=roles;
    }

    async saveButtonRole(){
        const {roleId,buttonIds}=this.ctx.request.body;

        let result;
        const conn = await this.app.mysql.beginTransaction(); // 初始化事务

        try {
            await conn.delete('t_role_button', {
                role_id: roleId,
            });  // 第一步操作
            if(buttonIds.length>0){
                let sql=`insert into t_role_button(role_id,button_id) values ${buttonIds.map((a)=>'('+roleId+','+a+')').reduce((a,b)=>a+','+b)}`;
                console.log(sql);
                result=await conn.query(sql);  // 第二步操作
            }

            await conn.commit(); // 提交事务
        } catch (err) {
            await conn.rollback(); // 一定记得捕获异常后回滚事务！！
            throw err;
        }
        const updateSuccess = buttonIds.length===0 || result.affectedRows === buttonIds.length;
        this.ctx.body={success:updateSuccess};

    }

    async save() {
        this.ctx.body = { success: await this.ctx.service.saveOrDelete.save('t_button',this.ctx.request.body)};
    }

    async delete() {
        this.ctx.body = { success: await this.ctx.service.saveOrDelete.delete('t_button',this.ctx.params.id) };
    }

    async allButtons(){

        let token=this.ctx.request.header['access-token'];
        let userInfo=await this.service.authorService.getAuthor(token);
        let result =[];
        if(userInfo.roles.length>0){
            result=await this.app.mysql.query(`select b.*,(select count(1) from t_role_button 
                    where button_id=b.id and role_id in (?)) available from t_button b where b.stateflag=1;`, [userInfo.roles.map(r=>r.id)]);
        }
        this.ctx.body=result;
    }

    async allRoles(){
        let sql=`select r.*,
            case when r.type=1 then (select name from t_system where id=r.system_id)
            else '机构角色' end sname
            from t_role r and stateflag=1`;
        let roles=await this.app.mysql.query(sql);
        this.ctx.body=roles;
    }

    //角色按钮权限页面获取菜单树和按钮
    async menuButtonTree() {
        let tree=await this.app.mysql.query(`select id,CONCAT(id,'treeid') 'key',parent_id,text,'menu-fold' icon,'1' type from t_menu where parent_id=1 and stateflag=1`);
        await this._menuButtonTree(tree);
        this.ctx.body=tree;
    }

    async _menuButtonTree(tree){
        for(let i=0;i<tree.length;i++){
            tree[i].children=[];
            const currentTree=await this.app.mysql.query(
                `select id,CONCAT(id,'treeid') 'key',parent_id,text,'menu-fold' icon,'1' type from t_menu where parent_id=? and stateflag=1`,[tree[i].id]);
            if(currentTree.length>0){
                tree[i].children=tree[i].children.concat(currentTree);
                await this._menuButtonTree(currentTree);
            }
            const currentBtn=await this.app.mysql.query(`
                select id,id 'key',menu_id 'parent_id',text,icon,'2' type from t_button where menu_id=? and stateflag=1
            `,[tree[i].id]);
            tree[i].children=tree[i].children.concat(currentBtn);
        }
    }
}

module.exports= ButtonController;
