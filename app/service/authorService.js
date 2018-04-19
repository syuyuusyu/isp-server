const Service=require('egg').Service;

class AuthorService extends Service{

    async getAuthor(token){
        //console.log(this.app.redis.get(token));
        let json= await this.app.redis.get(token);
        return JSON.parse(json);
    }

    async getByCode(code){
        let json= await this.app.redis.get(code);
        return JSON.parse(json);
    }

    //系统访问接口权限
    async invokePromiss(){
        let systems=await this.app.mysql.query(`select * from isp_system`);
        for(let system of systems){
            this.app.systemMap[system.code]=system.id;
            this.app.systemUrl[system.code]=system.url;
            let operations=await this.app.mysql.query(`select o.* from isp_sys_operation o join isp_sys_promiss_operation spo 
                on spo.operation_id=o.id where spo.system_id=?`,[system.id]);
            await this.app.redis.set(system.url,JSON.stringify(operations.map(m=>m.path)));
        }
    }

}


module.exports = AuthorService;