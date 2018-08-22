const Controller=require('egg').Controller;

class UserController extends Controller{

    async allUers(){
        let userType=this.ctx.params.userType;
        let sql=`select u.*,(
            case when u.type=1 
            then (select name from t_system where id=u.system_id) 
            else (select name from t_organization where id=u.org_id)  
	        end) belong
            from t_user u where type=? `
        sql='select * from t_user where stateflag=1';
        let users=await this.app.mysql.query(sql,[userType]);
        this.ctx.body=users;
    }

    async saveUserRole(){
        const {userId,roleIds}=this.ctx.request.body;

        let result;
        const conn = await this.app.mysql.beginTransaction(); // 初始化事务

        try {
            await conn.delete('t_user_role', {
                user_id: userId,
            });  // 第一步操作
            if(roleIds.length>0){
                let sql=`insert into t_user_role(user_id,role_id) values ${roleIds.map((a)=>'('+userId+','+a+')').reduce((a,b)=>a+','+b)}`;
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

    async userRoleConfRoles(){
        let userId=this.ctx.params.userId;
        let [user]=await this.app.mysql.query(`select * from t_user where id=?`,[userId]);
        let roles=[];
        if(user.type==='1'){
            roles=await this.app.mysql.query(`select * from t_role where type=1 and system_id=? and stateflag=1`,[user.system_id]);
        }else{
            roles=await this.app.mysql.query(`select * from t_role where type=2 and stateflag=1`,[]);
        }
        this.ctx.body=roles;
    }

    async queryUser(){
      let selectUser=this.ctx.request.body.selectUser;
      if(selectUser==='null'){
        let content=await this.app.mysql.query(`select * from t_user where  stateflag=?`, [1]);
        this.ctx.body = content;
      }else {
        let content = await this.app.mysql.query(`select * from t_user where name=? and stateflag=?`, [selectUser, 1]);
        this.ctx.body = content;
      }
    }


}

module.exports= UserController;
