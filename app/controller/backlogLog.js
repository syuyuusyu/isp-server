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
}
module.exports=BacklogLog;
