const Service = require('egg').Service;

class ActivitiInterfaces extends Service{

    async sysAccess(){
        let result=await this.app.mysql.query(
            `select s.id,s.name,(select count(1) from t_user_system where user_id=? and system_id=s.id) count from t_system s`,
            [this.ctx.params.userId]);
        this.ctx.body=result;
    }

    //平台访问权限申请流程被申请平台调用用户同步结果接口时执行对应的usertask流程
    async synuserresult(body){

        let activitiIp=this.app.config.self.activitiIp;
        const {system,reqdata:[{status,username,msg}]}=body;
        const [{name:systemName}]=await this.app.mysql.query(`select * from t_system where code=?`,[system]);
        console.log('-----------',`${activitiIp}/userTask/${username+system}`);
        let tasks=await this.app.curl(`${activitiIp}/userTask/${username+system}`,{
            method:'GET',
            head:{
                "Accept":"application/json",
                "Content-Type":"application/json;charset=UTF-8"
            },
            dataType: 'json',
        });
        //console.log(tasks);
        if(tasks.status===200){
            for(let i=0;i<tasks.data.length;i++){
                let {data:{data:message}}=await this.app.curl(`${activitiIp}/userTask/variables/${tasks.data[i].id}/message`,{
                    method:'GET',
                    dataType: 'json',
                });
                message=`${message} 申请${systemName}访问权限成功`
                console.log(message);
                let result=await this.app.curl(`${activitiIp}/userTask/submit/${tasks.data[i].id}`,{
                    method:'POS',
                    head:{
                        "Accept":"application/json",
                        "Content-Type":"application/json;charset=UTF-8"
                    },
                    dataType: 'json',
                    data:{
                        message:message
                    },

                });
                if(result.status===200){
                    this.app.logger.info(username+'申请'+systemName+' 获取用户推送结果流程完成',result.data.msg);
                }else{
                    this.app.logger.error(username+'申请'+systemName+' 获取用户推送结果流程完成',result);
                }

            }

        }
    }

}


module.exports=ActivitiInterfaces;