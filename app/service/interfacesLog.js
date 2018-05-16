const Service = require('egg').Service;

class InterfacesLog extends Service{
   log (body,result){
    if(body.method==='keyverify'){
      const createTime=new Date();
      const stateflag=1;
      const ip=this.ctx.ip;//调用接口的ip
      const interfacesName=body.method;//接口名
      const repdata=JSON.stringify(body);//请求报文信息
      const system=body.system.toLowerCase();//系统名
      //let invokeDate=new Date().toLocaleString();
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
      let systemCN;//系统中文名
      switch (system){
        case 's02':systemCN='云平台管理系统';
          break;
        case 's03':systemCN='大数据平台';
          break;
        case 's04':systemCN='数据采集系统';
          break;
        case 's05':systemCN='专业数据库管理系统';
          break;
        case 's06':systemCN='地质三维分析应用';
          break;
        case 's07':systemCN='运维平台';
          break;
        default:systemCN='系统未知';
      }
      if (result) {
        status = result.status;
        message = result.message;
        if (result.respdata) {
          respdata = JSON.stringify(result.respdata);
        }
      }

      /*let sql=`insert into interfaces_log(system,system_cn,ip,interfaces_name,reqdate_info,response_info,response_status,message,invoke_date) value (${system},${systemCN},${ip},${interfacesName},${repdata},${status},${message},${invokeDate})`;
      console.log("sql的值为：",sql);
      this.app.mysql.query(sql,[]);*/

      //this.app.mysql.query('insert into interfaces_log(system,system_cn,ip,interfaces_name,reqdate_info,response_info,response_status,message,invoke_date) value(?,?,?,?,?,?,?,?,?)', [system, systemCN, ip, interfacesName, repdata, respdata, status, message,invokeDate]);
      let interfaceInfo=[system,systemCN,ip,interfacesName,repdata,respdata,status,message,date,systemCN,date,stateflag];
      this.app.interfaceLog.push(interfaceInfo);
    }
  }
}
module.exports = InterfacesLog;
