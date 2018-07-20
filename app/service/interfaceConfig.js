const Service = require('egg').Service;

class InterfaceConfigService extends Service{
  async getInterfaceConfig(flag){
    let result=await this.app.mysql.query('select * from t_interface_config where flag=?',[flag]);
    return result;
  }
}
module.exports = InterfaceConfigService;
