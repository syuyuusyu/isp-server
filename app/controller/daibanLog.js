const Controller =require('egg').Controller;

class DaibanLog extends Controller{
  async allDaibanLog(){
    let content=await this.app.mysql.query('select * from t_daibai_log order by create_time desc',[]);
    this.ctx.body=content;
  }
  async allLoginName(){
    let content=await this.app.mysql.query('select DISTINCT operate_user from t_daibai_log',[]);
    this.ctx.body=content;
  }
  async allDaibanStatus(){
    let content=await this.app.mysql.query('select DISTINCT daiban_status from t_daibai_log',[]);
    this.ctx.body=content;
  }
  async queryDaibanLog(){
    const loginName=this.ctx.request.body.loginName;
    const daibanStatus=this.ctx.request.body.daibanStatus;
    let content;
    if(loginName!==''&&daibanStatus===''){
      let sql=`select * from t_daibai_log where operate_user=${"'"+loginName+"'"} order by create_time desc`;
      content=await this.app.mysql.query(sql);
    }else if(loginName===''&&daibanStatus!==''){
      let sql=`select * from t_daibai_log where daiban_status=${"'"+daibanStatus+"'"} order by create_time desc`;
      content=await this.app.mysql.query(sql);
    }else if(loginName!==''&&daibanStatus!==''){
      let sql=`select * from t_daibai_log where operate_user=${"'"+loginName+"'"} and daiban_status=${"'"+daibanStatus+"'"} order by create_time desc`;
      content=await this.app.mysql.query(sql);
    }else{
      content=await this.app.mysql.query('select * from t_daibai_log order by create_time desc',[]);
    }
    this.ctx.body=content;
  }
}
module.exports=DaibanLog;
