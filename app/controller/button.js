const Controller=require('egg').Controller;

class ButtonController extends Controller{
    async menuButton(){
        let buttons=await this.app.mysql.select('isp_button',{
            where:{menu_id:this.ctx.params.menuId}
        });
        this.ctx.body=buttons;
    }

    async buttonRole(){
        let roles=await this.app.mysql.query(`select r.* from isp_role r join isp_role_button rb on r.id=rb.role_id where rb.button_id=?`,
            [this.ctx.params.buttonId])
        this.ctx.body=roles;
    }

    async saveButtonRole(){
        const {buttonId,roleIds}=this.ctx.request.body;

        let result;
        const conn = await this.app.mysql.beginTransaction(); // 初始化事务

        try {
            await conn.delete('isp_role_button', {
                button_id: buttonId,
            });  // 第一步操作
            if(roleIds.length>0){
                let sql=`insert into isp_role_button(button_id,role_id) values ${roleIds.map((a)=>'('+buttonId+','+a+')').reduce((a,b)=>a+','+b)}`;
                console.log(sql);
                result=await conn.query(sql);  // 第二步操作
            }

            await conn.commit(); // 提交事务
        } catch (err) {
            await conn.rollback(); // 一定记得捕获异常后回滚事务！！
            throw err;
        }
        const updateSuccess = roleIds.length===0 || result.affectedRows === roleIds.length;
        this.ctx.body={success:updateSuccess};

    }

    async save(){
        const entity=this.ctx.request.body;
        let result={};
        if(entity.id){
            result = await this.app.mysql.update('isp_button', entity);
        }else {
            result = await this.app.mysql.insert('isp_button', entity); // 更新 posts 表中的记录
        }
        // 判断更新成功
        console.log(result);
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
        const result = await this.app.mysql.query(`select b.*,(select count(1) from isp_role_button 
            where button_id=b.id and role_id in (?)) available from isp_button b;`, [userInfo.roles.map(r=>r.id)]);
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
}

module.exports= ButtonController;