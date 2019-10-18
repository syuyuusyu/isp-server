const Service = require('egg').Service;

class AuthorService extends Service {

    async getAuthor(token) {
        // console.log(this.app.redis.get(token));
        const json = await this.app.redis.get(token);
        return JSON.parse(json);
    }

    async getByCode(code) {
        const json = await this.app.redis.get(code);
        return JSON.parse(json);
    }

    // 系统访问接口权限
    async invokePromiss() {
        this.ctx.logger.info('invokePromiss');
        const systems = await this.app.mysql.query('select * from t_system where stateflag=1');
        const systemMap={},systemUrl={};
        for (const system of systems) {
            systemMap[system.code] = system.id;
            systemUrl[system.code] = system.url;
            const operations = await this.app.mysql.query(`select o.*,t.code sysCode from t_sys_operation o join t_sys_promiss_operation spo 
                on spo.operation_id=o.id join t_system t on t.id=o.system_id where spo.system_id=? and o.stateflag=1`, [system.id]);
            //this.ctx.logger.info(system.url);
            //this.ctx.logger.info(JSON.stringify(operations.map(m => m.path)));
            await this.service.redis.set(system.url, operations.map(m => m.path));
            //keyverify
            await this.service.redis.set(system.keyverify_token,operations.map(m => ({path:m.path,code:m.sysCode})));
            await this.service.redis.set(`keyverify_token_${system.code}`, system.keyverify_token);
        }
        this.app.redis.set('systemMap', JSON.stringify(systemMap));
        this.app.redis.set('systemUrl', JSON.stringify(systemUrl));
    }

    //同步集成用户角色到流程引擎
    async actSynUser() {
        const invokeEntitys=await this.ctx.service.redis.get('invokeEntitys');
        const [invokeEntity] = invokeEntitys.filter(d => d.name === 'act_syn_user'),
            userRole = await this.app.mysql
                .query(`select r.code g,u.user_name u from t_user_role ut JOIN t_user u on ut.user_id=u.id join t_role r on r.id=ut.role_id`),
            usernames = await this.app.mysql.query(`select * from t_user where stateflag='1'`),
            groupnames = await this.app.mysql.query(`select * from t_role where stateflag='1'`),
            queryMap = {
                userRole: userRole.map(ur => ur.u + ',' + ur.g),
                usernames: usernames.map(u => u.user_name),
                groupnames: groupnames.map(r => r.code),
            };///act/userSyn
        console.log(queryMap);
        let result = await this.app.curl(`${this.app.config.self.activitiIp}/act/userSyn`, {
            method: 'POST',
            data: queryMap,
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json;charset=UTF-8"
            },
            dataType: 'json',
        });
        this.app.logger.info('同步集成用户角色到流程引擎', result.data);
    }

}


module.exports = AuthorService;
