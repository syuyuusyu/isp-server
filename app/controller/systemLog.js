const Controller =require('egg').Controller;

class SystemLog extends Controller{
  async allSystemLog(){
    let content=await this.app.mysql.query('select * from t_system_log where stateflag=1 order by operate_date desc',[]);
    this.ctx.body=content;
  }

  async allLoginName(){
    let content=await this.app.mysql.query('select DISTINCT login_name from t_system_log where stateflag=1',[]);
    this.ctx.body=content;
  }

  async allOperateType(){
    let content=await this.app.mysql.query('select DISTINCT operate_type from t_system_log where stateflag=1',[]);
    this.ctx.body=content;
  }

  async querySystemLog(){
    const loginName=this.ctx.request.body.loginName;
    const operateType=this.ctx.request.body.operateType;
    let content;
    if(loginName!==''&&operateType===''){
      let sql=`select * from t_system_log where login_name=${"'"+loginName+"'"} and stateflag=1  order by operate_date desc`;
      content=await this.app.mysql.query(sql);
    }else if(loginName===''&&operateType!==''){
      let sql=`select * from t_system_log where operate_type=${"'"+operateType+"'"} and stateflag=1 order by operate_date desc`;
      content=await this.app.mysql.query(sql);
    }else if(loginName!==''&&operateType!==''){
      let sql=`select * from t_system_log where login_name=${"'"+loginName+"'"} and operate_type=${"'"+operateType+"'"} and stateflag=1 order by operate_date desc`;
      content=await this.app.mysql.query(sql);
    }else{
      content=await this.app.mysql.query('select * from t_system_log where stateflag=1 order by operate_date desc',[]);
    }
    this.ctx.body=content;
  }
}
module.exports=SystemLog;
