const Controller =require('egg').Controller;

class InterfacesLog extends Controller{
  async allInterfacesLog(){
    let content=await this.app.mysql.query('select * from t_interfaces_log where stateflag=1 order by invoke_date desc',[]);
    this.ctx.body=content;
    //console.log("InterfacesLog中current的值为:",this.ctx.body);
  }

  async save() {
    this.ctx.body = { success: await this.ctx.service.saveOrDelete.save('t_interfaces_log',this.ctx.request.body)};
  }
  async refreshLog(){
    const interfaceInfo=await this.app.interfaceLog;
    let result;
    if(interfaceInfo.length!==0){
      let sql=`insert into t_interfaces_log(initiativeSystem,initiativeSystem_CN,initiative_ip,system,system_cn,ip,interfaces_name,reqdate_info,response_info,response_status,message,invoke_date,create_by,create_time,stateflag) values 
        ${interfaceInfo.map(a=>{return '('+ a.map(b=>"'"+b+"'").join(',')+')'}).reduce((a,b)=>a+','+b) }`;
      result= await this.app.mysql.query(sql);
      interfaceInfo.length=0;
    }
    //const refreshLogSuccess=result.protocol41===true;
    this.ctx.body={success:true};
  }

  async allSystem(){
    let content=await this.app.mysql.query('select DISTINCT system_cn from t_interfaces_log where stateflag=1',[]);
    //let content=await this.app.mysql.query('select * from interfaces_log',[]);
    this.ctx.body=content;
  }

  async allStatus(){
    let content=await this.app.mysql.query('select DISTINCT response_status from t_interfaces_log where stateflag=1',[]);
    //let content=await this.app.mysql.query('select * from interfaces_log',[]);
    this.ctx.body=content;
  }

  async queryLog(){
    //const{systemName,interfacesName}=this.ctx.request.body;
    const systemName=this.ctx.request.body.systemName;
    const statusName=this.ctx.request.body.statusName;
    let content;
    if(systemName!==''&&statusName===''){
      let sql=`select * from t_interfaces_log where system_cn=${"'"+systemName+"'"} and stateflag=1 order by invoke_date desc`;
      content=await this.app.mysql.query(sql);
    }else if(systemName===''&&statusName!==''){
      let sql=`select * from t_interfaces_log where response_status=${"'"+statusName+"'"} and stateflag=1 order by invoke_date desc`;
      content=await this.app.mysql.query(sql);
    }else if(systemName!==''&&statusName!==''){
      let sql=`select * from t_interfaces_log where system_cn=${"'"+systemName+"'"} and response_status=${"'"+statusName+"'"} and stateflag=1 order by invoke_date desc`;
      content=await this.app.mysql.query(sql);
    }else{
      content=await this.app.mysql.query('select * from t_interfaces_log where stateflag=1 order by invoke_date desc',[]);
    }
    this.ctx.body=content;
  }
}
module.exports=InterfacesLog;
