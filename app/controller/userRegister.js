const Controller =require('egg').Controller;

class UserRegister extends Controller{
    async userUnique(){
        let [{total}]=await this.app.mysql.query('select count(1) total from isp_user where user_name=?' ,[this.ctx.params.userName]);
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
}
module.exports=UserRegister;