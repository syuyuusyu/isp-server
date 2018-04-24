const Service = require('egg').Service;

class SystemLog extends Service{
  async loginLog(user,ip){
    if(ip==='::1'){
      ip='127.0.0.1'
    }
     this.app.mysql.query('insert into system_log(login_name,operate_type,operate_ip,operate_detail) value(?,?,?,?) ',[user,'登录',ip,'登录用户:'+user]);
  }

  async logoutLog(user,ip){
    if(ip==='::1'){
      ip='127.0.0.1'
    }
     this.app.mysql.query('insert into system_log(login_name,operate_type,operate_ip,operate_detail) value(?,?,?,?)',[user,'退出',ip,'退出用户:'+user]);
  }



  async operateLog(ctx){
    //console.log("========",this.ctx.request.body);
   /* let token=this.ctx.request.header['access-token'];
    let sd=await this.service.authorService.getAuthor(token);
    let user=sd.user.user_name;*/
   //let requestUrl=ctx.host.split(':')[0];


   let requestRouter=ctx.url;
   requestRouter=requestRouter.replace(/\d+/,'');
   const allRouter=this.app.allRouter;
   if((allRouter.search(requestRouter))!==-1){
     //console.log("进来啦")
     let token=this.ctx.request.header['access-token'];
     let sd=await this.service.authorService.getAuthor(token);
     let logoinUser=sd.user.user_name;
     let requestUrl=ctx.host.split(':')[0];
     //判断修改/新增角色信息
     if(requestRouter==='/role/save'){
       if(this.ctx.request.body.id){
         this.app.mysql.query('insert into system_log(login_name,operate_type,operate_ip,operate_detail) value(?,?,?,?)',[logoinUser,'修改',requestUrl,'修改角色信息']);
       }else {
         this.app.mysql.query('insert into system_log(login_name,operate_type,operate_ip,operate_detail) value(?,?,?,?)',[logoinUser,'新增',requestUrl,'新增角色']);
       }
     }else
     //判断修改/新增按钮信息
     if(requestRouter==='/btn/save'){
       if(this.ctx.request.body.id){
         this.app.mysql.query('insert into system_log(login_name,operate_type,operate_ip,operate_detail) value(?,?,?,?)',[logoinUser,'修改',requestUrl,'修改按钮信息']);
       }else {
         this.app.mysql.query('insert into system_log(login_name,operate_type,operate_ip,operate_detail) value(?,?,?,?)',[logoinUser,'新增',requestUrl,'新增按钮']);
       }
     }else
     //判断修改/新增系统
     if(requestRouter==='/sys/save'){
       if(this.ctx.request.body.id){
         this.app.mysql.query('insert into system_log(login_name,operate_type,operate_ip,operate_detail) value(?,?,?,?)',[logoinUser,'修改',requestUrl,'修改系统平台信息']);
       }else {
         this.app.mysql.query('insert into system_log(login_name,operate_type,operate_ip,operate_detail) value(?,?,?,?)',[logoinUser,'新增',requestUrl,'新增系统']);
       }
     }else
     //判断修改/新增系统平台/接口服务目录
     if(requestRouter==='/op/save'){
       if(this.ctx.request.body.id&&!this.ctx.request.body.method){
         this.app.mysql.query('insert into system_log(login_name,operate_type,operate_ip,operate_detail) value(?,?,?,?)',[logoinUser,'修改',requestUrl,'修改平台功能信息']);
       }else if(!this.ctx.request.body.id&&!this.ctx.request.body.method){
         this.app.mysql.query('insert into system_log(login_name,operate_type,operate_ip,operate_detail) value(?,?,?,?)',[logoinUser,'新增',requestUrl,'新增平台功能']);
       }else if(this.ctx.request.body.id&&this.ctx.request.body.method){
         this.app.mysql.query('insert into system_log(login_name,operate_type,operate_ip,operate_detail) value(?,?,?,?)',[logoinUser,'修改',requestUrl,'修改平台接口配置']);
       }else{
         this.app.mysql.query('insert into system_log(login_name,operate_type,operate_ip,operate_detail) value(?,?,?,?)',[logoinUser,'新增',requestUrl,'新增接口']);
       }
     }else{
     //根据其他路由从router_map表中取出操作信息然后存入系统日志表
     const content=await this.app.mysql.query('select router_info,router_type from router_map where router_name=?',[requestRouter]);
     const router_type=content[0].router_type;
     const router_info=content[0].router_info;
     console.log("content为:",router_type,router_info);
     this.app.mysql.query('insert into system_log(login_name,operate_type,operate_ip,operate_detail) value(?,?,?,?)',[logoinUser,router_type,requestUrl,router_info]);
   }}


  /* for(let i=0;i<content.length;i++){
      const routerName=content[i].router_name;
      if(requestRouter===routerName){
        while(requestRouter==='/role/save'){

        }
      }
    }*/
  }
}
module.exports = SystemLog;
