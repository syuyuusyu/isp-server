'use strict';

const Controller = require('egg').Controller;
const jwt = require('jsonwebtoken');
const fs = require('fs');

class HomeController extends Controller {
    async index() {
        await this.ctx.render('/index.html');
    }



    async doNothing(){
        this.ctx.body={}
    }

    async login() {
        let msg = await this.service.loginService.login(this.ctx.request.body);
        let user = {};
        let roles = [];
        let roleMenuId = [];
        let token = '';
        if (msg === '1') {
            [user] = await  this.app.mysql.query(
                `select id,name,user_name,phone,ID_number,email from t_user where user_name='${this.ctx.request.body.user_name}' and stateflag=1`);
            roles = await this.app.mysql.query(`select r.* from t_role r join t_user_role u on r.id=u.role_id  where u.user_id=${user.id} and r.stateflag=1 and u.stateflag=1`);
            const set = new Set();
            let menuId=[];
            if(roles.length>0){
                menuId = await this.app.mysql.query(`select menu_id from t_role_menu where role_id in (?) and stateflag=1`, [roles.map(m => m.id)]);
            }

            menuId.forEach(m => set.add(m.menu_id));
            set.forEach(m => roleMenuId.push(m));
            token = jwt.sign({payload: user}, this.app.secret, {
                //expiresIn: 30
            });
            this.app.redis.set(token, JSON.stringify({user, roles, roleMenuId}));
            this.service.systemLog.loginLog(this.ctx.request.body.user_name,this.ctx.ip);

            this.app.messenger.sendToAgent('loginMessage',{type:1,name:user.name,date:new Date()});
            let userCount=parseInt(await this.service.redis.get("userCount"));
            this.service.redis.set("userCount",userCount+1);

        }
        this.ctx.body = {msg, user, token, roles};
    }

    async randomToken(){
        const token = this.ctx.request.header['access-token'];
        const {user} = await this.service.redis.get(token);
        let ispToken=this.service.interfaces.randomString(8);
        this.service.redis.set(ispToken,user);
        this.ctx.body={ispToken};
    }

    async logout() {
        const token = this.ctx.request.header['access-token'];
        const auth = await this.service.authorService.getAuthor(token);
        this.app.messenger.sendToAgent('loginMessage',{type:0,name:auth.user.name,date:new Date()});
        this.service.systemLog.logoutLog(auth.user.user_name,this.ctx.ip);
        if(auth.systems){
            auth.systems.forEach(sys=>{
                let currentIndex=-1;
                this.ctx.service.redis.forEach(auth.user.user_name+'loginSystem',(code,index)=>{
                    if(sys.code===code){
                        currentIndex=index;
                        if(sys.operations.filter(o=>o.type==2).length===1){
                            this.ctx.logger.info(`${sys.url}${sys.operations.filter(o=>o.type==2).map(o=>o.path)[0]}?user=${auth.user.user_name}`);
                            this.app.curl(`${sys.url}${sys.operations.filter(o=>o.type==2).map(o=>o.path)[0]}?user=${auth.user.user_name}`)
                                .then(result=>{
                                    this.ctx.logger.info('退出结果:',result);
                                }).catch(e=>{
                                    this.ctx.logger.error(e);
                                });

                            //this.ctx.service.redis.splice(auth.user.user_name+'loginSystem',currentIndex,1);
                        }
                    }
                });
                this.app.redis.del(sys.token+sys.code);

            });
        }

        this.app.redis.del(token);
        let userCount=parseInt(await this.service.redis.get("userCount"));
        this.service.redis.set("userCount",userCount-1);
        setTimeout(()=>{
            this.app.redis.del(auth.user.user_name+'loginSystem');
        },5000);
        this.ctx.body={};

    }
}


module.exports = HomeController;


