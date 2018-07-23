const Controller =require('egg').Controller;

class ActivitiInterfaces extends Controller{


    async userSysAccess(){
        const [{id}]=await this.app.mysql.query(`select * from t_user where user_name=?`,[this.ctx.params.username]);
        let data=await this.app.mysql.query(
            `select s.id,s.code,s.name,(select count(1) from t_user_system where user_id=? and system_id=s.id) count 
            from t_system s where s.stateflag=1 and code<>'s01'`,
            [id]);
        let result=[];
        data.forEach(d=>{
            let value,editable;
            if(this.ctx.params.isApply==='apply'){
                value=d.count>0?true:false;
                editable=d.count>0?false:true;
            }else if(this.ctx.params.isApply==='cancel'){
                value=d.count>0?false:true;
                editable=d.count>0?true:false;
            }
            result.push({
                label:d.name,
                key:d.code,
                type:'check',
                editable:editable,
                value:value
            });
        });
        let message,unnecessary=false;
        if(result.filter(d=>!d.value).length===0){
            unnecessary=true;
            if(this.ctx.params.isApply==='apply'){
                message='已经拥有所有平台的访问权限,无需申请!';
            }else {
                message='没有任何平台权限,无法注销!';
            }
        }

        this.ctx.body={
            unnecessary,
            message,
            nextForm:result
        };
    }

    async pushUser(){
        let {username,applySystemCode,opType}=this.ctx.request.body;
        let result;
        try{
            const systems=await this.app.mysql.query(
                //`select s.*,so.path from t_system s join t_sys_operation so on s.id=so.system_id where so.type=? and s.code in(?) and s.stateflag=1`,
                `SELECT
                    s.*, (select path from t_sys_operation so where so.system_id=s.id and so.type=?) path
                FROM
                    t_system s
                where 
                 s.CODE IN(?)
                AND s.stateflag = 1`,
                [opType==='apply'?5:6,applySystemCode.split(',')]);
            //const invokeEntitys=await this.ctx.service.redis.get('invokeEntitys');
            //let [invokeEntity] =invokeEntitys.filter(d => d.id === 31);
            let [user]=await this.app.mysql.query(`select * from t_user where user_name=?`,[username]);
            for(let i=0;i<systems.length;i++){
                const sys=systems[i];
                    if(!sys.path){
                        this.app.messenger.sendToAgent('rabbitmqMsg', {
                            assigneeName:`${username}${sys.code}${opType}`,
                            count:0,
                            message:`${sys.name}没有配置${opType==='apply'?'推送用户':'注销用户'}接口`,
                            type:'error'
                        });
                        continue;
                    }
                    this.app.curl(`${sys.url}${sys.path}`,{
                        method:'POST',
                        data:{
                            username:username,
                            name: user.name,
                            phone: user.phone,
                            email: user.email?user.email:'',
                        },
                        headers:{
                            "Accept":"application/json",
                            "Content-Type":"application/json;charset=UTF-8"
                        },
                        dataType:'json'
                    }).then(async result=>{
                        if(result.status>=200 && result.status<300){
                            this.ctx.logger.error(sys.code);
                            this.app.messenger.sendToAgent('rabbitmqMsg', {
                                assigneeName:`${username}${sys.code}${opType}`,
                                count:0,
                                message:`调用${sys.name}${opType==='apply'?'推送用户':'注销用户'}成功,但未获得对方平台返回信息`,
                                type:'await'
                            });
                        }else{
                            this.ctx.logger.error(sys.code);
                            this.app.logger.error(`调用${sys.name}${opType==='apply'?'推送用户':'注销用户'}接口失败`,result);
                            this.app.messenger.sendToAgent('rabbitmqMsg', {
                                assigneeName:`${username}${sys.code}${opType}`,
                                count:0,
                                message:`调用${sys.name}${opType==='apply'?'推送用户':'注销用户'}接口失败`,
                                type:'error'
                            });
                        }
                    }).catch(async e=>{
                        this.ctx.logger.error(sys.code);
                        this.app.logger.error(`调用${sys.name}${opType==='apply'?'推送用户':'注销用户'}接口失败`,e.toString());
                        this.app.messenger.sendToAgent('rabbitmqMsg', {
                            assigneeName:`${username}${sys.code}${opType}`,
                            count:0,
                            message:`调用${sys.name}${opType==='apply'?'推送用户':'注销用户'}接口失败`,
                            type:'error'
                        });
                    });
            }
            result={success:true};
        }catch (e){
            this.ctx.logger.error(e.toString());
            result={success:false};
        }
        this.ctx.body=result;
    }


}

module.exports=ActivitiInterfaces;