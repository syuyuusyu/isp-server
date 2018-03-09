const Controller=require('egg').Controller;

class UserController extends Controller{

    async allUers(){
        let users=await this.app.mysql.select('isp_user');
        this.ctx.body=users;
    }

    async saveUserRole(){
        const {userId,roleIds}=this.ctx.request.body;

        let result;
        const conn = await this.app.mysql.beginTransaction(); // 初始化事务

        try {
            await conn.delete('isp_user_role', {
                user_id: userId,
            });  // 第一步操作
            if(roleIds.length>0){
                let sql=`insert into isp_user_role(user_id,role_id) values ${roleIds.map((a)=>'('+userId+','+a+')').reduce((a,b)=>a+','+b)}`;
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

}

module.exports= UserController;