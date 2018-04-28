const Controller =require('egg').Controller;

class UserRegister extends Controller{
    async userUnique(){
        let [{total}]=await this.app.mysql.query('select count(1) total from isp_user where user_name=?' ,[this.ctx.params.userName]);
        this.ctx.body={total}
    }

    async nickNameUnique(){
      let [{total}]=await this.app.mysql.query('select count(1) total from isp_user where name=?' ,[this.ctx.params.nickName]);
      this.ctx.body={total}
    }

    async IDnumberUnique(){
        let [{total}]=await this.app.mysql.query('select count(1) total from isp_user where ID_number=?' ,[this.ctx.params.IDnumber]);
        this.ctx.body={total}
    }

    async phoneUnique(){
        let [{total}]=await this.app.mysql.query('select count(1) total from isp_user where phone=?' ,[this.ctx.params.phoneNumber]);
        this.ctx.body={total}
    }

    async emailUnique(){
        let [{total}]=await this.app.mysql.query('select count(1) total from isp_user where email=?' ,[this.ctx.params.email]);
        this.ctx.body={total}
    }

    async save(){
      const entity=this.ctx.request.body;
      const userName=entity.userName;
      const nickName=entity.nickName;
      const password=entity.password;
      const IDnumber=entity.IDnumber;
      const phone=entity.phone;
      const email=entity.email;
      const randomNumber=entity.randomNumber;
      let result=await this.app.mysql.insert('isp_user',{user_name:userName,passwd:password,name:nickName,ID_number:IDnumber,phone:phone,email:email,salt:randomNumber});
      //console.log("result的值为:",result);
      // 判断插入成功
      const insertSuccess = result.affectedRows === 1;
      if(insertSuccess===true){
        let getUserId=await this.app.mysql.query('select id from isp_user where user_name=?',[userName])
        //为新增的用户分配默认角色
        if(getUserId!==null){
          await this.app.mysql.insert('isp_user_role',{user_id:getUserId[0].id,role_id:20});
        }
      }
      this.ctx.body={success:insertSuccess};
    }
}
module.exports=UserRegister;
