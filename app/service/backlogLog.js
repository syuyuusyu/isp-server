const Service = require('egg').Service;

class BacklogLog extends Service{
  async backlog(user,ip,backlogInfo,backlogStatus){
    this.app.mysql.query('insert into t_backlog_log(operate_user,operate_ip,backlog_info,backlog_status,create_by,update_by,create_time,update_time,stateflag) value(?,?,?,?,?,?,?,?,?)',[user,ip,backlogInfo,backlogStatus,'邓荣涛','邓荣涛',new Date(),new Date(),1]);
  }
}
module.exports = BacklogLog;
