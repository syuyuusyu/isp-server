const Controller =require('egg').Controller;

class BacklogLog extends Controller{
  async allBacklogLog(){
    let content=await this.app.mysql.query('select * from t_backlog_log order by create_time desc',[]);
    this.ctx.body=content;
  }
  async allLoginName(){
    let content=await this.app.mysql.query('select DISTINCT operate_user from t_backlog_log',[]);
    this.ctx.body=content;
  }
  async allBacklogStatus(){
    let content=await this.app.mysql.query('select DISTINCT backlog_status from t_backlog_log',[]);
    this.ctx.body=content;
  }
  async queryBacklogLog(){
    const loginName=this.ctx.request.body.loginName;
    const backlogStatus=this.ctx.request.body.backlogStatus;
    let content;
    if(loginName!==''&&backlogStatus===''){
      let sql=`select * from t_backlog_log where operate_user=${"'"+loginName+"'"} order by create_time desc`;
      content=await this.app.mysql.query(sql);
    }else if(loginName===''&&backlogStatus!==''){
      let sql=`select * from t_backlog_log where backlog_status=${"'"+backlogStatus+"'"} order by create_time desc`;
      content=await this.app.mysql.query(sql);
    }else if(loginName!==''&&backlogStatus!==''){
      let sql=`select * from t_backlog_log where operate_user=${"'"+loginName+"'"} and backlog_status=${"'"+backlogStatus+"'"} order by create_time desc`;
      content=await this.app.mysql.query(sql);
    }else{
      content=await this.app.mysql.query('select * from t_backlog_log order by create_time desc',[]);
    }
    this.ctx.body=content;
  }

   async backLogForApply(){
    let token=this.ctx.request.header['access-token'];
    let sd=await this.service.authorService.getAuthor(token);
    let user=sd.user.user_name;
    let requestUrl=this.ctx.host.split(':')[0];

    let businessKey=this.ctx.request.body.startResult.businessKey;
    let processName;
    if(businessKey.startsWith('platform_apply')){
      processName='申请平台访问权限';
    }else{processName='注销平台访问权限'}

     let content=await this.app.mysql.insert('t_backlog_log',
       {
         operate_user: user,
         operate_ip: requestUrl,
         backlog_info:processName,
         backlog_status:'开始申请',
         create_by:user,
       });
   }

   async backLogForsubmitApply(){
     let token=this.ctx.request.header['access-token'];
     let sd=await this.service.authorService.getAuthor(token);
     let user=sd.user.user_name;
     let requestUrl=this.ctx.host.split(':')[0];

     let values=this.ctx.request.body.values;
     let selectedTask=this.ctx.request.body.selectedTask;
     let processDefinitionKey=this.ctx.request.body.processDefinitionKey;

     if(values.message===undefined){
       let submitKey;
       if(processDefinitionKey.key==='platform_apply'){
         submitKey='提交申请平台访问权限的申请';
       }else{submitKey='提交注销平台访问权限的申请'}

       let content=await this.app.mysql.insert('t_backlog_log',
         {
           operate_user: user,
           operate_ip: requestUrl,
           backlog_info:submitKey,
           backlog_status:'提交申请',
           create_by:user,
         });
     }else{
       let submitKey;
       let message=values.message;
       if(message===''){
         message='无'
       }
       let approval=values.approval;
       let owner=selectedTask.owner;
       if(processDefinitionKey.key==='platform_apply'){
         submitKey='申请平台访问权限的申请';
       }else{submitKey='注销平台访问权限的申请'}
       console.log("approval的值为:",approval);
       if(approval===true){
         let content=await this.app.mysql.insert('t_backlog_log',
           {
             operate_user: user,
             operate_ip: requestUrl,
             backlog_info:`同意${owner}用户${submitKey}`,
             backlog_status:'审批',
             create_by:user,
           });
       }else{
         let content=await this.app.mysql.insert('t_backlog_log',
           {
             operate_user: user,
             operate_ip: requestUrl,
             backlog_info:`拒绝${owner}用户${submitKey} 拒绝原因：${message}`,
             backlog_status:'审批',
             create_by:user,
           });
       }
     }
   }
}
module.exports=BacklogLog;
