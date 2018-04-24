const Service = require('egg').Service;

class DaibanLog extends Service{
  async daiban(user,ip,daibanInfo,daibanStatus){
    //console.log("各项的值为:",user,ip,daibanInfo,daibanStatus);
    this.app.mysql.query('insert into t_daibai_log(operate_user,operate_ip,daiban_info,daiban_status,create_by,update_by,create_time,update_time,stateflag) value(?,?,?,?,?,?,?,?,?)',[user,ip,daibanInfo,daibanStatus,'邓荣涛','邓荣涛',new Date(),new Date(),1]);
  }
}
module.exports = DaibanLog;
