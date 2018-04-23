'use strict';

const Controller = require('egg').Controller;
const jwt = require('jsonwebtoken');

class HomeController extends Controller {
    async index() {
        await this.ctx.render('/index.html');
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
            this.service.systemLog.loginLog(this.ctx.request.body.user_name,this.ctx.ip);
        }
        this.ctx.body = {msg, user, token, roles};
        //return {msg,user,token};
    }

    async logout() {
        const token = this.ctx.request.header['access-token'];
        const auth = await this.service.authorService.getAuthor(token);
        this.service.systemLog.logoutLog(auth.user.user_name,this.ctx.ip);
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

        let obj=[ '{"ds_name":"sum","cluster_name":"","graph_type":"stack","host_name":"","metric_name":"compute1 last custom   ","color":"#555555","datapoints":[[1.2,1524210495],[1.2,1524210510],[1.2,1524210525],[1.2733333333,1524210540],[0.98,1524210555],[0.9,1524210570],[1.06,1524210585],[1.1,1524210600],[1.1,1524210615],[1.1,1524210630],[1.1,1524210645],[1.1,1524210660],[0.94,1524210675],[0.9,1524210690],[0.9,1524210705],["NaN",1524210720],["NaN",1524210735]]}',
  '{"ds_name":"sum","cluster_name":"","graph_type":"stack","host_name":"","metric_name":"compute2 last custom   ","color":"#555555","datapoints":[[0.7,1524210495],[0.7,1524210510],[0.7,1524210525],[0.84666666667,1524210540],[0.9,1524210555],[0.9,1524210570],[0.9,1524210585],[0.9,1524210600],[0.9,1524210615],[0.82,1524210630],[0.8,1524210645],[0.8,1524210660],[0.8,1524210675],[0.8,1524210690],[0.8,1524210705],["NaN",1524210720],["NaN",1524210735]]}',
  '{"ds_name":"sum","cluster_name":"","graph_type":"stack","host_name":"","metric_name":"compute3 last custom   ","color":"#555555","datapoints":[[4.3,1524210495],[4.3,1524210510],[4.3,1524210525],[4.52,1524210540],[4.6,1524210555],[4.6,1524210570],[4.6,1524210585],[4.6,1524210600],[4.6,1524210615],[4.44,1524210630],[4.4,1524210645],[4.4,1524210660],[4.4,1524210675],[4.4,1524210690],[4.4,1524210705],["NaN",1524210720],["NaN",1524210735]]}',
  '{"ds_name":"sum","cluster_name":"","graph_type":"stack","host_name":"","metric_name":"compute4 last custom   ","color":"#555555","datapoints":[[2.1,1524210495],[2.1,1524210510],[2.1,1524210525],[2.1,1524210540],[2.1,1524210555],[2.1,1524210570],[2.1,1524210585],[2.1,1524210600],[2.1,1524210615],[2.1,1524210630],[2.1,1524210645],[2.1,1524210660],[2.1,1524210675],[2.1,1524210690],[2.1,1524210705],["NaN",1524210720],["NaN",1524210735]]}',
  '{"ds_name":"sum","cluster_name":"","graph_type":"stack","host_name":"","metric_name":"compute5 last custom   ","color":"#555555","datapoints":[[1,1524210495],[1,1524210510],[1,1524210525],[1.22,1524210540],[1.3,1524210555],[1.3,1524210570],[1.3,1524210585],[1.3,1524210600],[1.3,1524210615],[1.06,1524210630],[1,1524210645],[1,1524210660],[1,1524210675],[1,1524210690],[1,1524210705],["NaN",1524210720],["NaN",1524210735]]}',
  '{"ds_name":"sum","cluster_name":"","graph_type":"stack","host_name":"","metric_name":"controller last custom   ","color":"#555555","datapoints":[[5.0666666667,1524210495],[3.7666666667,1524210510],[2.5133333333,1524210525],[2.52,1524210540],[3.48,1524210555],[3.38,1524210570],[3.06,1524210585],[2.78,1524210600],[3.5,1524210615],[3.54,1524210630],[2.86,1524210645],[2.86,1524210660],[4.42,1524210675],[3.84,1524210690],[2.88,1524210705],["NaN",1524210720],["NaN",1524210735]]}' ]
       let sdsd= obj.map(d=>{
            return JSON.parse(d);
        });

        this.app.redis.del(token);
        this.ctx.body={};

    }
}

module.exports = HomeController;
