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
            result.push({
                label:d.name,
                key:d.code,
                type:'switch',
                editable:d.count>0?false:true,
                value:d.count>0?true:false
            });
        });

        console.log(result);
        this.ctx.body=result;
    }

    async pushUser(){
        let {username,applySystemCode}=this.ctx.request.body;
        let result;
        try{
            const systems=await this.app.mysql.query(
                `select s.*,so.path from t_system s join t_sys_operation so on s.id=so.system_id where so.type=5 and s.code in(?) and s.stateflag=1`,
                [applySystemCode.split(',')]);
            let [invokeEntity] =this.app.invokeEntitys.filter(d => d.id === 31);
            let [user]=await this.app.mysql.query(`select * from t_user where user_name=?`,[username]);
            for(let sys of systems){
               this.service.restful.invoke(invokeEntity,{...user,url:sys.url,path:sys.path,username:user.user_name});
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