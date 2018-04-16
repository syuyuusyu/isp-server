const Controller =require('egg').Controller;

class InterfaceController extends Controller{

    async interfaces(){
        const body=this.ctx.request.body;
        const result=await this.service.interfaces[body.method](body);

        this.ctx.body=result;
        this.log(body,result);
    }

    log(body,result){
        const ip=this.ctx.ip;//调用接口的ip
        const interfacesName=body.method;//接口名
        const repdata=JSON.stringify(body.reqdata);//请求体信息
        const system=body.system.toLowerCase();//系统名
        let invokeDate=new Date().toLocaleString();
        //let invokeDate=(new Date()).valueOf();
        console.log("invokeDate的值为:",invokeDate);
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
        let interfaceInfo=[system,systemCN,ip,interfacesName,repdata,respdata,status,message,invokeDate];
        this.app.interfaceLog.push(interfaceInfo);
        //console.log("controler中app.interfaceLog的值为：",this.app.interfaceLog);
    }

}

module.exports=InterfaceController;