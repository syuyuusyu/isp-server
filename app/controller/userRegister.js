const Controller = require('egg').Controller;

class UserRegister extends Controller {
    async userUnique() {
        let [{total}] = await this.app.mysql.query('select count(1) total from t_user where user_name=?', [this.ctx.params.userName]);
        this.ctx.body = {total}
    }

    async nickNameUnique() {
        let [{total}] = await this.app.mysql.query('select count(1) total from t_user where name=?', [this.ctx.params.nickName]);
        this.ctx.body = {total}
    }

    async IDnumberUnique() {
        let [{total}] = await this.app.mysql.query('select count(1) total from t_user where ID_number=?', [this.ctx.params.IDnumber]);
        this.ctx.body = {total}
    }

    async phoneUnique() {
        let [{total}] = await this.app.mysql.query('select count(1) total from t_user where phone=?', [this.ctx.params.phoneNumber]);
        this.ctx.body = {total}
    }

    async emailUnique() {
        let [{total}] = await this.app.mysql.query('select count(1) total from t_user where email=?', [this.ctx.params.email]);
        this.ctx.body = {total}
    }

    async save() {
        const entity = this.ctx.request.body;
        const userName = entity.userName;
        const nickName = entity.nickName;
        const password = entity.password;
        const IDnumber = entity.IDnumber;
        const phone = entity.phone;
        const email = entity.email;
        const randomNumber = entity.randomNumber;
        const orgCheckedKeys = entity.orgCheckedKeys;
        let insertAllSuccess = false;

        //获取调用此接口ip(日志用)
        let ip = this.ctx.ip;

        //获取前端传过来的所选择的节点的最终子节点
        //let resultOrg=await this.orgCheckedKeys(orgCheckedKeys);
        console.log(orgCheckedKeys);
        //console.log("resultOrg的值为:",resultOrg);

        let getUserName = await this.app.mysql.query('select * from t_user', []);
        for (const getUserNameValue of getUserName) {
            if (getUserNameValue.user_name === userName) {
                return this.ctx.body = {
                    success: '账号已经存在'
                }
            }
        }
        let insertNewUser = await this.app.mysql.insert('t_user', {
            user_name: userName,
            passwd: password,
            name: nickName,
            ID_number: IDnumber,
            phone: phone,
            email: email,
            salt: randomNumber
        });
        // 判断插入成功
        const insertSuccess = insertNewUser.affectedRows === 1;
        let result;
        if (insertSuccess === true) {
            const conn = await this.app.mysql.beginTransaction();
            try {
                await conn.insert('t_user_role', {user_id: insertNewUser.insertId, role_id: 20});  // 第一步操作
                let sql = `insert into t_user_org(user_id,org_id) values ${orgCheckedKeys.map((a) => '(' + insertNewUser.insertId + ',' + a + ')').reduce((a, b) => a + ',' + b)}`;
                result = await conn.query(sql);  // 第二步操作
                await conn.commit(); // 提交事务
            } catch (err) {
                // error, rollback
                await conn.rollback(); // 一定记得捕获异常后回滚事务！！
                throw err;
            }
        }

        insertAllSuccess = (insertNewUser.affectedRows === 1);
        this.ctx.body = {success: insertAllSuccess};
        //存日志
        this.ctx.service.systemLog.userRegister(userName, ip)
        //同步到流程引擎
        this.ctx.service.authorService.actSynUser();
    }

    async getOrg() {
        let parentId = this.ctx.params.id;
        let ids=await this.service.entity.childList(parentId,'id','parent_id','t_organization');
        let content=await this.app.mysql.query('select * from t_organization where id in(?) and stateflag=?',[ids,1]);
        //let content = await this.app.mysql.query('select * from t_organization where stateflag=? ', [1]);
        this.ctx.body = content;
    }

    async orgCheckedKeys(orgCheckedKeys) {
        let leafOrg = [];
        let content = await this.app.mysql.query('select * from t_organization', []);
        for (let i of content) {
            for (let j of orgCheckedKeys) {
                if (j === i['id'].toString() && i.is_leaf === '1') {
                    leafOrg.push(j)
                }
            }
        }
        return leafOrg;
    }

    async getOrgName() {
        const checkedKeys = this.ctx.request.body;
    }
}

module.exports = UserRegister;
