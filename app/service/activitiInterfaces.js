const Service = require('egg').Service;

class ActivitiInterfaces extends Service {

  async sysAccess() {
    const result = await this.app.mysql.query(
      'select s.id,s.name,(select count(1) from t_user_system where user_id=? and system_id=s.id) count from t_system s',
      [ this.ctx.params.userId ]);
    this.ctx.body = result;
  }


  async synuserresult(body,opType) {

      const activitiIp = this.app.config.self.activitiIp;
      const { system, reqdata: [{ status, username, msg }] } = body;
      const [{ name: systemName }] = await this.app.mysql.query('select * from t_system where code=?', [ system ]);
      console.log('-----------', `${activitiIp}/userTask/${username + system}`);
      const tasks = await this.app.curl(`${activitiIp}/userTask/${username + system}`, {
        method: 'GET',
        head: {
          Accept: 'application/json',
          'Content-Type': 'application/json;charset=UTF-8',
        },
        dataType: 'json',
      });
      if (tasks.status === 200) {
        for (let i = 0; i < 1; i++) {
          let { data: { data: message } } = await this.app.curl(`${activitiIp}/userTask/variables/${tasks.data[i].id}/message`, {
            method: 'GET',
            dataType: 'json',
          });
          let opMessage='',
              succMsg='';
          if(opType==='apply'){
              opMessage='申请';
          }else{
              opMessage='注销';
          }
          if(status=='801'){
              succMsg='成功';
          }else{
              succMsg='失败,该系统拒绝了请求';
          }
          message = `${message} ${opMessage}${systemName}权限${succMsg}`;

          const result=await this.service.restful.invoke(this.app.invokeEntitys.filter(d=>d.id===82)[0],{activitiIp:activitiIp,taskId:tasks.data[i].id,message:message});
          this.app.logger.info(username + '申请' + systemName + ' 获取用户推送结果流程完成', result);

        }

      }


  }

}


module.exports = ActivitiInterfaces;
