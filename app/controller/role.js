const Controller=require('egg').Controller;

class RoleController extends Controller{

    async allRoles(){
        // let roleType=this.ctx.params.roleType;
        // let sql=`select r.*,s.name sname from isp_role r JOIN isp_system s on r.system_id=s.id where r.type=1`;
        // if(roleType==='2'){
        //     sql=`select * from isp_role where type=2`;
        // }
        let sql=`select * from isp_role`;
        let content=await this.app.mysql.query(sql,[]);
        this.ctx.body=content;
    }



    async codeUnique(){
        const {value,systemId}=this.ctx.request.body;
        if((value+'').trim()===''){
            this.ctx.body={total:1};
            return;
        }
        let [{total}]=await this.app.mysql.query(`select count(1) total from isp_role where code=? and system_id=?`
            , [value,systemId]);
        this.ctx.body={total};
    }

    async save(){
        const entity=this.ctx.request.body;
        let result={};
        console.log(entity);
        if(entity.id){
            result = await this.app.mysql.update('isp_role', entity);
        }else {
            result = await this.app.mysql.insert('isp_role', entity); // 更新 posts 表中的记录
        }
        // 判断更新成功
        console.log(result);
        const updateSuccess = result.affectedRows === 1;
        this.ctx.body={success:updateSuccess};
    }

    async delete(){
        const result = await this.app.mysql.delete('isp_role', {
            id: this.ctx.params.id
        });
        const updateSuccess = result.affectedRows === 1;
        this.ctx.body={success:updateSuccess};
    }

    async saveRoleMenu(){
        const {roleId,menuIds}=this.ctx.request.body;
        let sql=`insert into isp_role_menu(role_id,menu_id) values ${menuIds.map((a)=>'('+roleId+','+a+')').reduce((a,b)=>a+','+b)}`;
        let result;
        const conn = await this.app.mysql.beginTransaction(); // 初始化事务

        try {
            await conn.delete('isp_role_menu', {
                role_id: roleId,
            });  // 第一步操作
            result=await conn.query(sql);  // 第二步操作
            await conn.commit(); // 提交事务
        } catch (err) {
            await conn.rollback(); // 一定记得捕获异常后回滚事务！！
            throw err;
        }
        console.log(result);
        const updateSuccess = result.affectedRows === menuIds.length;
        this.ctx.body={success:updateSuccess};
    }

    async roleMenu(){
        let menu=await this.app.mysql.select('isp_menu',{
            where:{
                parent_id:this.ctx.params.id
            }
        });
        this.ctx.body=menu;
    }

    async roleMenuIds(){
        let menuIds=await this.app.mysql.query(`select menu_id from isp_role_menu where role_id=?`,[this.ctx.params.roleId]);
        this.ctx.body=menuIds;
    }

    async userRole(){
        let roles=await this.app.mysql.query(`select r.* from isp_role r join isp_user_role ur on r.id=ur.role_id where ur.user_id=?`,
            [this.ctx.params.userId])
        this.ctx.body=roles;
    }





}

module.exports=RoleController;