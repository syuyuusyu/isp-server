const Service=require('egg').Service;

class LoginService extends Service{

    async login(user){
        console.log(user);
        let [{userExist}]=await this.app.mysql.query(`select count(1) userExist from isp_user where user_name='${user.user_name}'`);
        if(userExist===0){
            return '2';
        }
        let [{currentUser}]=await this.app.mysql
            .query(`select count(1) currentUser from isp_user where user_name='${user.user_name}' and passwd=password('${user.passwd}')`);
        if(userExist===1 && currentUser===0){
            return '3'
        }
        if(userExist===1 && currentUser===1){
            return '1'
        }
        return '4';
    }

}


module.exports = LoginService;