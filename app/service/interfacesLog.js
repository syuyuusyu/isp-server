const Service = require('egg').Service;

class InterfacesLog extends Service{
   async log (body,result){
    if(body.method==='keyverify'){
      const createTime=new Date();
      const stateflag=1;
      let ip=this.ctx.ip;//调用综合集成接口的ip
      if(ip==='::1'){
        ip='127.0.0.1'
      }
      const interfacesName=body.method;//接口名
      const repdata=JSON.stringify(body);//请求报文信息
      const system=body.system.toLowerCase();//被调用方的系统号
      const systemCN=await this.getSystemCN(system);//被调用方的系统中文名
      let initiativeIp=body.reqdata;//主动调用方的域名
      initiativeIp=initiativeIp[0].domain;
      const initiativeSystem=await this.getInitiativeSystem(initiativeIp);//主动调用方的系统号
      const initiativeSystemCN=await this.getSystemCN(initiativeSystem);//主动调用方的系统中文名
      let invokeDate=new Date();
      //const date=invokeDate.setTime(invokeDate.getTime()+invokeDate.getTimezoneOffset()*60*1000+480*60*1000);
      const Y=invokeDate.getFullYear()+'-';
      const M=(invokeDate.getMonth()+1 < 10 ? '0'+(invokeDate.getMonth()+1) : invokeDate.getMonth()+1) + '-';
      const D=(invokeDate.getDate()+1<10? '0'+(invokeDate.getDate()):invokeDate.getDate())+' ';
      const h=(invokeDate.getHours()+1<10? '0'+(invokeDate.getHours()):invokeDate.getHours())+':';
      const m=(invokeDate.getMinutes()+1<10? '0'+(invokeDate.getMinutes()):invokeDate.getMinutes())+':';
      const s=(invokeDate.getSeconds()+1<10? '0'+(invokeDate.getSeconds()):invokeDate.getSeconds());
      const date=Y+M+D+h+m+s;

      let status='';//响应状态
      let message='';//响应状态信息
      let respdata='无响应体';//响应体

      if (result) {
        status = result.status;
        message = result.message;
        if (result.respdata) {
          respdata = JSON.stringify(result.respdata);
        }
      }

      let interfaceInfo=[initiativeSystem,initiativeSystemCN,initiativeIp,system,systemCN,ip,interfacesName,repdata,respdata,status,message,date,systemCN,date,stateflag];
      //this.app.interfaceLog.push(interfaceInfo);
      //将interfaceInfo存入redis中
      this.app.redis.sadd("interfaceInfo",interfaceInfo.join("----"));
    }
  }
  //获取主动调用方的系统号
  async getInitiativeSystem(domain){
    const result=await this.app.mysql.query('select * from t_system where url=?',[domain]);
    if(result.length===1){
      const initiativeSystem=result[0].code;
     return initiativeSystem;
    }else{
      return '系统号未知'
    }
  }

  async getSystemCN(system){
     const result=await this.app.mysql.query('select * from t_system where code=?',[system]);
     if(result.length===1){
       const systemCN=result[0].name;
       return systemCN;
     }else{
       return '系统未知';
     }
  }
}
module.exports = InterfacesLog;
