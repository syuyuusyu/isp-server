const Service = require('egg').Service;

class SystemLog extends Service{
  async loginLog(user,ip){
    if(ip==='::1'){
      ip='127.0.0.1'
    }
     this.app.mysql.query('insert into t_system_log(login_name,operate_type,operate_ip,operate_detail,create_by) value(?,?,?,?,?) ',[user,'登录',ip,'登录用户:'+user,user]);
  }

  async logoutLog(user,ip){
    if(ip==='::1'){
      ip='127.0.0.1'
    }
     this.app.mysql.query('insert into t_system_log(login_name,operate_type,operate_ip,operate_detail,create_by) value(?,?,?,?,?)',[user,'退出',ip,'退出用户:'+user,user]);
  }

  async resetPassword(user,ip){
    if(ip==='::1'){
      ip='127.0.0.1'
    }
    this.app.mysql.query('insert into t_system_log(login_name,operate_type,operate_ip,operate_detail,create_by) value(?,?,?,?,?)',[user,'重置密码',ip,'重置密码',user]);
  }

  async userRegister(user,ip){
    if(ip==='::1'){
      ip='127.0.0.1'
    }
    this.app.mysql.query('insert into t_system_log(login_name,operate_type,operate_ip,operate_detail,create_by) value(?,?,?,?,?)',[user,'注册',ip,'用户注册，注册账号:'+user,user]);
  }

  async operateLog(ctx){
    //console.log("========",this.ctx.request.body);
   /* let token=this.ctx.request.header['access-token'];
    let sd=await this.service.authorService.getAuthor(token);
    let user=sd.user.user_name;*/
   //let requestUrl=ctx.host.split(':')[0];

   let requestRouter=ctx.url;
   requestRouter=requestRouter.replace(/\d+/,'');
   const allRouter=await this.getRouter();
   //const allRouter=this.app.allRouter;
   if((allRouter.search(requestRouter))!==-1){
     let token=this.ctx.request.header['access-token'];
     let sd=await this.service.authorService.getAuthor(token);
     let logoinUser=sd.user.user_name;
     let requestUrl=ctx.host.split(':')[0];
     //判断修改/新增角色信息
     if(requestRouter==='/role/save'){
       if(this.ctx.request.body.id){
         this.app.mysql.query('insert into t_system_log(login_name,operate_type,operate_ip,operate_detail) value(?,?,?,?)',[logoinUser,'修改',requestUrl,'修改角色信息']);
       }else {
         this.app.mysql.query('insert into t_system_log(login_name,operate_type,operate_ip,operate_detail) value(?,?,?,?)',[logoinUser,'新增',requestUrl,'新增角色']);
       }
     }else
     //判断修改/新增按钮信息
     if(requestRouter==='/btn/save'){
       if(this.ctx.request.body.id){
         this.app.mysql.query('insert into t_system_log(login_name,operate_type,operate_ip,operate_detail,create_by) value(?,?,?,?,?)',[logoinUser,'修改',requestUrl,'修改按钮信息',logoinUser]);
       }else {
         this.app.mysql.query('insert into t_system_log(login_name,operate_type,operate_ip,operate_detail,create_by) value(?,?,?,?,?)',[logoinUser,'新增',requestUrl,'新增按钮',logoinUser]);
       }
     }else
     //判断修改/新增系统
     if(requestRouter==='/sys/save'){
       if(this.ctx.request.body.id){
         this.app.mysql.query('insert into t_system_log(login_name,operate_type,operate_ip,operate_detail,create_by) value(?,?,?,?,?)',[logoinUser,'修改',requestUrl,'修改系统平台信息',logoinUser]);
       }else {
         this.app.mysql.query('insert into t_system_log(login_name,operate_type,operate_ip,operate_detail,create_by) value(?,?,?,?,?)',[logoinUser,'新增',requestUrl,'新增系统',logoinUser]);
       }
     }else
     //判断修改/新增系统平台/接口服务目录
     if(requestRouter==='/op/save'){
       if(this.ctx.request.body.id&&!this.ctx.request.body.method){
         this.app.mysql.query('insert into t_system_log(login_name,operate_type,operate_ip,operate_detail,create_by) value(?,?,?,?,?)',[logoinUser,'修改',requestUrl,'修改平台功能信息',logoinUser]);
       }else if(!this.ctx.request.body.id&&!this.ctx.request.body.method){
         this.app.mysql.query('insert into t_system_log(login_name,operate_type,operate_ip,operate_detail,create_by) value(?,?,?,?,?)',[logoinUser,'新增',requestUrl,'新增平台功能',logoinUser]);
       }else if(this.ctx.request.body.id&&this.ctx.request.body.method){
         this.app.mysql.query('insert into t_system_log(login_name,operate_type,operate_ip,operate_detail,create_by) value(?,?,?,?,?)',[logoinUser,'修改',requestUrl,'修改平台接口配置',logoinUser]);
       }else{
         this.app.mysql.query('insert into t_system_log(login_name,operate_type,operate_ip,operate_detail,create_by) value(?,?,?,?,?)',[logoinUser,'新增',requestUrl,'新增接口',logoinUser]);
       }
     }else{
     //根据其他路由从router_map表中取出操作信息然后存入系统日志表
     const content=await this.app.mysql.query('select router_info,router_type from t_router_map where router_name=?',[requestRouter]);
     const router_type=content[0].router_type;
     const router_info=content[0].router_info;
     //console.log("content为:",router_type,router_info);
     this.app.mysql.query('insert into t_system_log(login_name,operate_type,operate_ip,operate_detail,create_by) value(?,?,?,?,?)',[logoinUser,router_type,requestUrl,router_info,logoinUser]);
    }
   }
  }
  //获取所有增、删、改的路由
  async getRouter(){
    let allRouter=[];
    let content=await this.app.mysql.query(`select router_name from t_router_map`);
    for(let i=0;i<content.length;i++){
      allRouter.push(content[i].router_name)
    }
   allRouter=allRouter.toString();
    return allRouter;
  }
}
module.exports = SystemLog;
