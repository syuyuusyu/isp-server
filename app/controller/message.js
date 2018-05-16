const Controller =require('egg').Controller;

class MessageController extends Controller{

    //申请平台
    async sendApplyPlateformMsg(){
        const {applySystemIds}=this.ctx.request.body;
        const token=this.ctx.request.header['access-token'];
        const {user}=await this.service.authorService.getAuthor(token);
        const systems=await this.app.mysql.query(`select * from t_system where id in (?) and stateflag=1`,[applySystemIds]);
        const entity={
            send_user_id:user.id,
            receive_type:2,
            message_type:1,
            receive_role_id:19,
            create_time:this.app.mysql.literals.now,
            message:`${user.name}申请访问:${systems.map(s=>s.name).join(',')};访问权限`,
            memo:systems.map(s=>s.id).join(','),
            step:1,
            send_user_name:user.name
        };
        const success=await this.service.message.save(entity);
        this.ctx.body={success};
        this.service.backlogLog.backlog(user.user_name,this.ctx.host.split(':')[0],entity.message,'申请');
    }

    async receive(){
        const token=this.ctx.request.header['access-token'];
        const {user,roles}=await this.service.authorService.getAuthor(token);
        const all=await this.app.mysql.query(`select * from t_message where step=1`);
        const message=all.filter(d=>d.receive_type==='1').filter(d=>
            //指定用户
            d.receive_user_id===user.id
        ).concat(
            all.filter(d=>d.receive_type==='2').filter(d=>
                //指定角色
                roles.map(r=>r.id).filter(id=>id===d.receive_role_id).length>0
            )
        );
        this.ctx.body=message;
    }

    async approvalPlatform(){
        const token=this.ctx.request.header['access-token'];
        const {user:currentUser}=await this.service.authorService.getAuthor(token);
        const message=this.ctx.request.body;
        this.ctx.logger.info('调用用户同步接口',message);
        message.message=`${message.message}\n
            用户${currentUser.name}于${new Date()}批准了该申请`;
        let result;
        try{
            this.service.message.setComplete(message);
            const systems=await this.app.mysql.query(
                `select s.*,so.path from t_system s join t_sys_operation so on s.id=so.system_id where so.type=5 and s.id in(?) and s.stateflag=1`,
                [message.memo.split(',')]);

            let [invokeEntity] =this.app.invokeEntitys.filter(d => d.id === 31);
            let [user]=await this.app.mysql.query(`select * from t_user where id=?`,[message.send_user_id]);
            for(let sys of systems){
                this.service.restful.invoke(invokeEntity,{...user,url:sys.url,path:sys.path,username:user.user_name});
            }
            result={success:true};
        }catch (e){
            this.ctx.logger.error(e.toString());
            result={success:false};
        }
        this.ctx.body=result;
        this.service.backlogLog.backlog(currentUser.user_name,this.ctx.host.split(':')[0],message.message,'批准');
    }

    async disApproval(){
        const token=this.ctx.request.header['access-token'];
        const {user:currentUser}=await this.service.authorService.getAuthor(token);
        const message=this.ctx.request.body;
        message.message=`${message.message}\n
            用户${currentUser.name}于${new Date()}否决申请`;
        //将当前消息置为完成
        this.service.message.save({...message,step:2});
        //将否决消息发给申请用户
        this.service.message.save({
            send_user_id:currentUser.id,
            send_user_name:currentUser.name,
            receive_type:1,
            receive_user_id:message.send_user_id,
            message_type:2,
            create_time:this.app.mysql.literals.now,
            message:`您的申请平台访问权限被${currentUser.name}否决`,
            step:1,
        });
        this.ctx.body={success:true};
        this.service.backlogLog.backlog(currentUser.user_name,this.ctx.host.split(':')[0],message.message,'否决');

    }

    async deleteMsg(){
        const result = await this.app.mysql.delete('t_message', {
            id: this.ctx.params.id
        });
        const updateSuccess = result.affectedRows === 1;
        this.ctx.body={success:updateSuccess};
    }

}

module.exports= MessageController;
