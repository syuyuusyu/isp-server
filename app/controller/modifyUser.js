const Controller = require('egg').Controller;
const crypto = require('crypto');

class ModifyUser extends Controller {
  /* async checkOriginalPw() {
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
   }*/

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
    //console.log("entity的值为:",entity);
    const userName = entity.userName;
    const nickName = entity.nickName;
    const originalPassword = entity.originalPassword;
    const newPassword = entity.newPassword;
    const confirmNewPassword = entity.confirmNewPassword;
    const IDnumber = entity.IDnumber;
    const email = entity.email;
    //let result;
    //当没有修改密码或确认密码时更新用户名，身份证号，邮箱
    if (newPassword === '' || confirmNewPassword === '') {
      const row = {
        name: nickName,
        ID_number: IDnumber,
        email: email,
        update_by:userName,
        update_time:new Date(),
      };
      const options = {
        where: {
          user_name: userName
        }
      };
      let result = await this.app.mysql.update('t_user', row, options);
      const updateSuccess = result.affectedRows === 1;
      this.ctx.body = {success: updateSuccess};
    } else if (originalPassword !== '', newPassword !== '' && confirmNewPassword !== '') {
      //对输入的初始密码进行验证
      let queryResult = await this.app.mysql.query('select passwd,salt from t_user where user_name=?', [userName]);
      const salt = queryResult[0].salt;//库中的salt
      const userPwDB = queryResult[0].passwd;//库中用户的密码
      const hmac = crypto.createHmac('sha256', salt);
      const inputPwHmac = hmac.update(originalPassword).digest('hex');//加密后的前端输入的初始密码
      //比较库中的密码和输入的初始密码是否相同，如果不相同返回错误信息，如果相同，将修改密码存入库中
      const compare = (userPwDB === inputPwHmac);
      if (!compare) {
        this.ctx.body = {success: '初始密码错误'};
      } else {
        const row = {
          name: nickName,
          passwd: newPassword,
          ID_number: IDnumber,
          email: email,
          salt: entity.salt,
          update_by:userName,
          update_time:new Date(),
        };
        const options = {
          where: {
            user_name: userName
          }
        };
        let result = await this.app.mysql.update('t_user', row, options);
        const updateSuccess = result.affectedRows === 1;
        this.ctx.body = {success: updateSuccess};
      }
    }
  }
}

module.exports = ModifyUser;
