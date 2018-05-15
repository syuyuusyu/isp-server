const Controller = require('egg').Controller;
const crypto = require('crypto');

class ModifyUser extends Controller {
  async checkOriginalPw() {
    const originalPw = this.ctx.params.originalPw;
    let token = this.ctx.request.header['access-token'];
    let sd = await this.service.authorService.getAuthor(token);
    let logoinUser = sd.user.user_name;
    let result = await this.app.mysql.query('select passwd,salt from t_user where user_name=?', [logoinUser]);
    const salt = result[0].salt;
    const loginPwDB = result[0].passwd;//库中用户的密码
    const hmac = crypto.createHmac('sha256', salt);
    const loginPwHmac = hmac.update(originalPw).digest('hex');//加密后的前端输入的密码
    const comparePw = (loginPwDB === loginPwHmac);
    this.ctx.body = {success: comparePw};
  }

  async checkIDnumberUnique() {
    let [{total}] = await this.app.mysql.query('select count(1) total from t_user where ID_number=?', [this.ctx.params.IDnumber]);
    this.ctx.body = {total}
  }

  async checkEmailUnique() {
    let [{total}] = await this.app.mysql.query('select count(1) total from t_user where email=?', [this.ctx.params.email]);
    this.ctx.body = {total}
  }

  async save() {
    const entity = this.ctx.request.body;
    let result;
    //当没有修改密码或确认密码时更新用户名，身份证号，邮箱
    if ( entity.newPassword === '' || entity.confirmNewPassword === '') {
      const row = {
        name: entity.nickName,
        ID_number: entity.IDnumber,
        email: entity.email
      };
      const options = {
        where: {
          user_name: entity.userName
        }
      };
      result = await this.app.mysql.update('t_user', row, options);
    }else if(entity.newPassword!==''&&entity.confirmNewPassword!==''){//当修改密码时更新用户名，密码，身份证号，邮箱，salt
      const row = {
        name: entity.nickName,
        passwd:entity.newPassword,
        ID_number: entity.IDnumber,
        email: entity.email,
        salt:entity.salt
      };
      const options = {
        where: {
          user_name: entity.userName
        }
      };
      result = await this.app.mysql.update('t_user', row, options);
    }
    const updateSuccess = result.affectedRows === 1;
    this.ctx.body={success:updateSuccess};
  }
}

module.exports = ModifyUser;
