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
    const systems = await this.app.mysql.query('select * from t_system where stateflag=1');
    for (const system of systems) {
      this.app.systemMap[system.code] = system.id;
      this.app.systemUrl[system.code] = system.url;
      const operations = await this.app.mysql.query(`select o.* from t_sys_operation o join t_sys_promiss_operation spo 
                on spo.operation_id=o.id where spo.system_id=? and o.stateflag=1`, [ system.id ]);
      this.ctx.logger.info(system.url);
      this.ctx.logger.info(JSON.stringify(operations.map(m => m.path)));
      await this.app.redis.set(system.url, JSON.stringify(operations.map(m => m.path)));
    }
  }

}


module.exports = AuthorService;
