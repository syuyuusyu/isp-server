const Controller=require('egg').Controller;

class ButtonController extends Controller{
    async menuButton(){
        let buttons=await this.app.mysql.select('t_button',{
            where:{menu_id:this.ctx.params.menuId}
        });
        this.ctx.body=buttons;
    }

    async buttonRole(){
        let roles=await this.app.mysql.query(`select r.* from isp_role_button r where r.role_id=?`,
            [this.ctx.params.roleId]);
        this.ctx.body=roles;
    }

    async saveButtonRole(){
        const {roleId,buttonIds}=this.ctx.request.body;

        let result;
        const conn = await this.app.mysql.beginTransaction(); // 初始化事务

        try {
            await conn.delete('isp_role_button', {
                role_id: roleId,
            });  // 第一步操作
            if(buttonIds.length>0){
                let sql=`insert into isp_role_button(role_id,button_id) values ${buttonIds.map((a)=>'('+roleId+','+a+')').reduce((a,b)=>a+','+b)}`;
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

    async save(){
        const entity=this.ctx.request.body;
        let result={};
        if(entity.id){
            result = await this.app.mysql.update('isp_button', entity);
        }else {
            result = await this.app.mysql.insert('isp_button', entity);
        }
        // 判断更新成功
        console.log(result);//insertId
        const updateSuccess = result.affectedRows === 1;
        this.ctx.body={success:updateSuccess};
    }

    async delete(){
        const result = await this.app.mysql.delete('isp_button', {
            id: this.ctx.params.id
        });
        const updateSuccess = result.affectedRows === 1;
        this.ctx.body={success:updateSuccess};
    }

    async allButtons(){

        let token=this.ctx.request.header['access-token'];
        let userInfo=await this.service.authorService.getAuthor(token);
        let result =[];
        if(userInfo.roles.length>0){
            result=await this.app.mysql.query(`select b.*,(select count(1) from isp_role_button 
                    where button_id=b.id and role_id in (?)) available from isp_button b;`, [userInfo.roles.map(r=>r.id)]);
        }
        this.ctx.body=result;
    }

    async allRoles(){
        let sql=`select r.*,
            case when r.type=1 then (select name from isp_system where id=r.system_id)
            else '机构角色' end sname
            from isp_role r`;
        let roles=await this.app.mysql.query(sql);
        this.ctx.body=roles;
    }

    //角色按钮权限页面获取菜单树和按钮
    async menuButtonTree() {
        let tree=await this.app.mysql.query(`select id,CONCAT(id,'treeid') 'key',parent_id,text,'menu-fold' icon,'1' type from isp_menu where parent_id=1`);
        await this._menuButtonTree(tree);
        this.ctx.body=tree;
    }

    async _menuButtonTree(tree){
        for(let i=0;i<tree.length;i++){
            tree[i].children=[];
            const currentTree=await this.app.mysql.query(
                `select id,CONCAT(id,'treeid') 'key',parent_id,text,'menu-fold' icon,'1' type from isp_menu where parent_id=?`,[tree[i].id]);
            if(currentTree.length>0){
                tree[i].children=tree[i].children.concat(currentTree);
                await this._menuButtonTree(currentTree);
            }
            const currentBtn=await this.app.mysql.query(`
                select id,id 'key',menu_id 'parent_id',text,icon,'2' type from isp_button where menu_id=?
            `,[tree[i].id]);
            tree[i].children=tree[i].children.concat(currentBtn);
        }
    }
}

module.exports= ButtonController;
