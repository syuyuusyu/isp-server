'use strict';

const Controller = require('egg').Controller;
const jwt = require('jsonwebtoken');

class HomeController extends Controller {
    async index() {
        await this.ctx.render('/build/index.html');
    }

    async login() {
        let msg = await this.service.loginService.login(this.ctx.request.body);
        let user = {};
        let roles = [];
        let roleMenuId = [];
        let token = '';
        if (msg === '1') {
            [user] = await  this.app.mysql.query(
                `select id,name,user_name,phone,email from isp_user where user_name='${this.ctx.request.body.user_name}'`);
            roles = await this.app.mysql.query(`select r.* from isp_role r join isp_user_role u on r.id=u.role_id  where u.user_id=${user.id}`);
            const set = new Set();
            let menuId=[];
            if(roles.length>0){
                menuId = await this.app.mysql.query(`select menu_id from isp_role_menu where role_id in (?)`, [roles.map(m => m.id)]);
            }

            menuId.forEach(m => set.add(m.menu_id));
            set.forEach(m => roleMenuId.push(m));
            token = jwt.sign({payload: user}, this.app.secret, {
                //expiresIn: 30
            });
            this.app.redis.set(token, JSON.stringify({user, roles, roleMenuId}));
        }
        this.ctx.body = {msg, user, token, roles};
        //return {msg,user,token};
    }

    async logout() {
        const token = this.ctx.request.header['access-token'];
        const auth = await this.service.authorService.getAuthor(token);
        if(auth.systems){
            auth.systems.forEach(sys=>{
                let currentIndex=-1;
                this.app.loginSystem.forEach((code,index)=>{
                    if(sys.code===code){
                        currentIndex=index;
                        if(sys.operations.filter(o=>o.type===2).length===1){
                            auth.user.user_name=auth.user.user_name.replace(/^s\d{2}(\w+)/,(w,p)=>{
                                return p;
                            });
                            this.app.curl(`${sys.url}${sys.operations.filter(o=>o.type===2).map(o=>o.path)[0]}?user=${auth.user.user_name}`);
                            this.app.loginSystem.splice(currentIndex,1)
                        }
                    }
                });
                this.app.redis.del(sys.token+sys.code);

            });
        }

        this.app.redis.del(token);
        this.ctx.body={};

    }
}

module.exports = HomeController;
