const Service = require('egg').Service;

class InterfaceConfigService extends Service{
  async getInterfaceConfig(flag){
    //flag为1是服务资源目录,为2是系统元数据
    let result=await this.app.mysql.query('select * from t_interface_config where flag=?',[flag]);
    for(let i of result){
      //根据id查询出系统的url和path并封装进result中
      let systemUrl=await this.app.mysql.query('select url from t_system where id=?',[i.systemId]);
      i.url=systemUrl[0].url;
      if(flag==='1'){
        let path=await this.app.mysql.query('select path from t_sys_operation where system_id=? and type=?',[i.systemId,7]);
        i.path=path[0].path;
      }
      if(flag==='2'){
        let path=await this.app.mysql.query('select path from t_sys_operation where system_id=? and type=?',[i.systemId,8]);
        i.path=path[0].path;
      }
    }
    return result;
  }
}
module.exports = InterfaceConfigService;
