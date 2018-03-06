const Controller=require('egg').Controller;

class UserController extends Controller{

    async allUers(){
        let users=await this.app.mysql.select('isp_user');
        this.ctx.body=users;
    }

}

module.exports= UserController;