const Controller=require('egg').Controller;

class SystemController extends Controller{
    async allSystem(){
        let content=await this.app.mysql.query('select * from t_system where stateflag=1',[]);
        this.ctx.body=content;
    }

    async checkUnique(){
        let [{total}]=await this.app.mysql.query('select count(1) total from t_system where code=?' ,[this.ctx.params.code]);
        this.ctx.body={total}
    }

    // async save(){
    //     const entity=this.ctx.request.body;
    //     let result={};
    //     if(entity.id){
    //         result = await this.app.mysql.update('t_system', entity);
    //     }else {
    //         result = await this.app.mysql.insert('t_system', entity); // 更新 posts 表中的记录
    //     }
    //     let systems=await this.app.mysql.query(`select * from t_system`);
    //     systems.forEach(s=>{
    //        this.app.systemMap[s.code]=s.id;
    //        this.app.systemUrl[s.code]=s.url;
    //     });
    //     // 判断更新成功
    //     const updateSuccess = result.affectedRows === 1;
    //     this.ctx.body={success:updateSuccess};
    // }
    //
    // async delete(){
    //     const result = await this.app.mysql.delete('t_system', {
    //         id: this.ctx.params.id
    //     });
    //     let systems=await this.app.mysql.query(`select * from t_system`);
    //     systems.forEach(s=>{
    //         this.app.systemMap[s.code]=s.id;
    //     });
    //     const updateSuccess = result.affectedRows === 1;
    //     this.ctx.body={success:updateSuccess};
    // }

    async save() {
        console.log(this.ctx.request.body);
        this.ctx.body = { success: await this.ctx.service.saveOrDelete.save('t_system',this.ctx.request.body)};
        this.ctx.service.authorService.invokePromiss();
    }

    async delete() {
        this.ctx.body = { success: await this.ctx.service.saveOrDelete.delete('t_system',this.ctx.params.id) };
        this.ctx.service.authorService.invokePromiss();
    }

    async currentSys(){
        let content=await this.app.mysql.query('select * from t_system where id=?',[this.ctx.params.id]);
        this.ctx.body=content;
    };

    async currentSysPath(){
      let content=await this.app.mysql.query('select * from t_sys_operation where system_id=? and type=?',[this.ctx.params.id,7]);
      this.ctx.body=content;
    };

    async sysRole(){
        let systems=await this.app.mysql.query(`select s.* from t_system s join t_sys_role sr on s.id=sr.system_id where sr.role_id=?`,
            [this.ctx.params.roleId]);
        this.ctx.body=systems;
    }

    async saveSysRole(){
        const {sysIds,roleId}=this.ctx.request.body;

        let result;
        const conn = await this.app.mysql.beginTransaction(); // 初始化事务

        try {
            await conn.delete('t_sys_role', {
                role_id: roleId,
            });  // 第一步操作
            if(sysIds.length>0){
                let sql=`insert into t_sys_role(role_id,system_id) values ${sysIds.map((a)=>'('+roleId+','+a+')').reduce((a,b)=>a+','+b)}`;
                result=await conn.query(sql);  // 第二步操作
            }

            await conn.commit(); // 提交事务
        } catch (err) {
            await conn.rollback(); // 一定记得捕获异常后回滚事务！！
            throw err;
        }
        const updateSuccess = sysIds.length===0 || result.affectedRows === sysIds.length;
        //刷新系统访问接口权限
        this.ctx.service.authorService.invokePromiss();
        this.ctx.body={success:updateSuccess};

    }

    async currentRoleSys(){
        //let sql=`select s.* from t_system s join t_sys_role rs on rs.system_id=s.id where rs.role_id in (?) order by s.id`;
        let sql=`select s.* from t_system s join t_user_system us on us.system_id=s.id where us.user_id=? and s.accessType='1' order by s.orderIndex`;
        const token =this.ctx.request.header['access-token'];
        const auth=await this.service.authorService.getAuthor(token);
        const {user,roles}=auth;
        let systems=[];
        // if(roles.length>0){
        //     systems= await this.app.mysql.query(sql,[roles.map(r=>r.id)]);
        // }
        systems= await this.app.mysql.query(sql,[user.id]);

        auth.systems=[];
        for(let i=0;i<systems.length;i++){
            const operations=await this.app.mysql.query(`select * from t_sys_operation where system_id=?`,[systems[i].id]);
            let loginToken=this.service.interfaces.randomString(8);
            this.app.redis.set(loginToken+(systems[i].code).toLowerCase(),JSON.stringify(user));
            systems[i].operations=operations;
            auth.systems.push(systems[i]);
            systems[i].token=loginToken;
        }
        this.app.redis.set(token,JSON.stringify(auth));
        this.ctx.body=systems;
    }

    async sysAccess(){
        let result=await this.app.mysql.query(
            `select s.id,s.name,(select count(1) from t_user_system where user_id=? and system_id=s.id) count from t_system s`,
            [this.ctx.params.userId]);
        this.ctx.body=result;
    }

    async updateServiceTree(){
        let {treeId,ids} = this.ctx.request.body;
        let sql=`update t_sys_operation set service_tree_id = ? where id in (?)`;
        let data=await this.app.mysql.query(sql,[treeId,ids]);
        const updateSuccess = data.affectedRows === ids.length;
        this.ctx.body={success:updateSuccess};
    }

    async  getSystemApi(){
        let [{name}] = await this.app.mysql.query(`select name from t_system where id=?`,[this.ctx.params.systemId]);
        let result = await this.app.mysql.query(`select t.url,t.name,o.path
            from t_system t join t_sys_operation o on o.system_id=t.id where t.id=? and o.type=7`,[this.ctx.params.systemId]);
        if(result.length==0){
            this.ctx.body={
                success:false,
                msg:`${name}没有配置请求推送服务目录接口`
            };
            return;
        }
        let [{url,path}]=result;
        let token = await this.service.redis.get(`keyverify_token_s01`);
        try{
            let json=await this.app.curl(`${url}${path}`,{
                method:'GET',
                headers:{
                    "Accept":"application/json",
                    "Content-Type":"application/json;charset=UTF-8",
                    "token":token
                },
                dataType:'json'
            });
            this.ctx.logger.info(json);
            this.ctx.body={
                success:true,
                msg:`同步成功`
            };
        }catch (e){
            this.ctx.body={
                success:false,
                msg:`调用${name}接口错误`
            };
        }
    }

    async synServicesList(){
        let [{url,name,code}] = await this.app.mysql.query(`select url,name,code from t_system where id=?`,[this.ctx.params.systemId]);
        let [op] =await this.app.mysql.query(`select * from t_sys_operation where type=7 and system_id=?`,[this.ctx.params.systemId]);
        if(!op){
            this.ctx.body={
                success:false,
                msg:`${name}没有配置服务资源目录接口`
            };
            return;
        }
        try{
            let json=await this.app.curl(`${url}${op.path}`,{
                method:'GET',
                headers:{
                    "Accept":"application/json",
                    "Content-Type":"application/json;charset=UTF-8",
                    "keyid":await this.ctx.service.redis.get(`keyverify_token_s01`),
                },
                dataType:'json'
            });
            json=json.data;
            if(json.length && json.length>0 && json[0].path){
                let result=await this.service.interfaces.push_interface({system:code,reqdata:json});
                if(result.status=='801'){
                    await this.app.mysql.query(
                        `update t_sys_operation o join t_system t on t.id=o.system_id set o.fullPath=CONCAT(t.url,o.path) 
                            where o.type=3 and o.system_id=?`,[this.ctx.params.systemId]);
                    this.ctx.body={
                        success:true,
                        msg:`${name}${result.message}`
                    };
                    return;
                }else{
                    this.ctx.body={
                        success:false,
                        msg:`${name}同步失败`
                    };
                }
            }else{
                this.ctx.body={
                    success:false,
                    msg:`${name}返回数据不合法`
                };
                return;
            }
        }catch (e){
            console.log(e);
            this.ctx.body={
                success:false,
                msg:`调用接口${url}${op.path}失败!`
            };
        }



    }
}

module.exports= SystemController;

