const Controller =require('egg').Controller;
const crypto = require('crypto');

class ResetPassword extends  Controller{
  async resetPassword(){
    //重置密码的用户
   const userName=this.ctx.params.userName;
   //获取登录的用户
    let token=this.ctx.request.header['access-token'];
    let sd=await this.service.authorService.getAuthor(token);
    let logoinUser=sd.user.user_name;
    //获取调用此接口ip(日志用)
    let ip=this.ctx.ip;
    //获取salt并对密码加密
    const salt=Math.random().toString().substr(2,10);
    const hmac = crypto.createHmac('sha256', salt);
    const newPassword=hmac.update('123456').digest('hex');
    console.log(newPassword,salt,logoinUser,new Date(),userName);
    let result=await this.app.mysql.query('update t_user set passwd=?,salt=?,update_by=?,update_time=? where user_name=?',[newPassword,salt,logoinUser,new Date(),userName]);
    const updateSuccess = result.affectedRows === 1;
    this.ctx.body={success:updateSuccess};
    //存日志
    this.ctx.service.systemLog.resetPassword(logoinUser,ip)
  }
}
module.exports = ResetPassword;

