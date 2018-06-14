const Service = require('egg').Service;

class InterfaceService extends Service {

    async verifications(body) {

        let {system, reqdata: [{token}]} = body;
        system=system.toLowerCase();
        let user = await this.service.authorService.getByCode(token);
        if(!user){
            user = await this.service.authorService.getByCode(token + system);
            if (!user) {
                this.ctx.logger.info('令牌token无效');
                return {
                    status: '806',
                    message: '令牌token无效'
                };
            } else {
                this.app.redis.del(token + system);
                this.app.loginSystem.push(system);
                this.ctx.logger.info('成功');
                return {
                    status: '801',
                    message: '成功',
                    respdata: [
                        {
                            username: user.user_name,
                        }
                    ]
                };
            }
        }

        this.app.redis.del(token);
        this.ctx.logger.info('成功');
        return {
            status: '801',
            message: '成功',
            respdata: [
                {
                    username: user.user_name,
                }
            ]
        };


    }

    async synuser(body) {
        let {system, reqdata: users} = body;
        system = system.toLocaleLowerCase();
        let [sysEntity] = await this.app.mysql.query(`select * from t_system where code=?`, [system]);
        if (!sysEntity) {
            return {
                status: '806',
                message: `对应系统编码:${system},不存在`,
            }
        }
        try {
            for (let u of users) {
                let [result] = await this.app.mysql.query(`select id from t_user where phone=?`, [system + u.username]);
                if (result) {
                    let currentId=result.id;
                    await this.app.mysql.update('t_user',
                        {
                            id: currentId,
                            system_id: sysEntity.id,
                            user_name: system + u.username,
                            name: u.name,
                            type: '1'
                        });
                } else {
                    const Literal = this.app.mysql.literals.Literal;
                    await this.app.mysql.insert('t_user',
                        {
                            system_id: sysEntity.id, type: '1',
                            user_name: system + u.username, name: u.name, passwd: new Literal(`password('123456')`)
                        });
                }
            }
        } catch (e) {
            this.ctx.logger.error(new Error('同步用户接口错误'), e);
            return {
                status: '806',
                message: `系统错误:${e.toString()}`,
            }
        }
        return {
            status: '801',
            message: `成功`,
        }


    }

    async synrole(body){
        let {system, reqdata: roles} = body;
        system = system.toLocaleLowerCase();
        let [sysEntity] = await this.app.mysql.query(`select * from t_system where code=?`, [system]);
        if (!sysEntity) {
            return {
                status: '806',
                message: `对应系统编码:${system},不存在`,
            }
        }
        try {
            for (let r of roles) {
                console.log(system + r.rolename);
                let [result] = await this.app.mysql.query(`select id from t_role where code=?`, [system + r.rolename]);
                console.log(result);
                if (result) {
                    let currentId=result.id;
                    await this.app.mysql.update('t_role',
                        {
                            id: currentId,
                            system_id: sysEntity.id,
                            code: system + r.rolename,
                            name: r.name,
                            type: '1'
                        });
                } else {
                    await this.app.mysql.insert('t_role',
                        {
                            system_id: sysEntity.id, type: '1',
                            code: system + r.rolename, name: r.name,
                        });
                }
            }
        } catch (e) {
            this.ctx.logger.error('同步角色接口错误', e);
            return {
                status: '806',
                message: `系统错误:${e.toString()}`,
            }
        }
        return {
            status: '801',
            message: `成功`,
        }
    }

    //keyverify
    async keyverify(body) {
        const { reqdata:[{domain,path:path}]} = body;

        let codes=await this.service.authorService.getByCode(domain);
        //this.ctx.logger.info('接口权限认证:codes',codes);
        if(codes && codes.filter(c=>{
                let rep=/(?:\{)\w+(?:\})/;
                let a=c.replace(rep,(w,p)=>{
                    return '.*?'
                });
                return new RegExp(a).test(path);
            }).length>0){
            return {
                status: '801',
                message: `成功`,
            }
        }else{
            return {
                status: '806',
                message: `没有访问权限`,
            }
        }
    }

    async metadata(body){
        const {system,reqdata} =body;
        const syatemId=this.app.systemMap[system.toLowerCase()];
        if(!syatemId){
            return {
                status:'806',
                message:'对应系统号不存在'
            }
        }
        this.ctx.logger.info(syatemId);
        this.ctx.logger.info(reqdata);
        const conn = await this.app.mysql.beginTransaction(); // 初始化事务
        try{
            for(let metdata of reqdata){
                let fields=metdata.fields;
                delete metdata.fields;
                let [met]=await conn.query(`select id from t_metadata where name=? and system_id=?`,[metdata.name,syatemId]);
                if(met && met.id){
                    await conn.update('t_metadata',{...metdata,id:met.id,system_id:syatemId})
                    await conn.delete('t_metadata_fields',{metadata_id:met.id});
                    for (let field of fields){
                        await conn.insert('t_metadata_fields',{...field,metadata_id:met.id})
                    }
                }else{
                    let result=await  conn.insert('t_metadata',{...metdata,system_id:syatemId})
                    await conn.delete('t_metadata_fields',{metadata_id:result.insertId});
                    for (let field of fields){
                        await conn.insert('t_metadata_fields',{...field,metadata_id:result.insertId})
                    }
                }
            }
            await conn.commit();
            return {
                status:'801',
                message:'同步成功'
            }
        }catch (e){
            await conn.rollback(); // 一定记得捕获异常后回滚事务！！
            this.ctx.logger.error(e);
            return {
                status:'806',
                message:'失败'
            }
        }
    }

    async push_interface(body){
        const {system,reqdata} =body;
        const syatemId=this.app.systemMap[system.toLowerCase()];
        if(!syatemId){
            return {
                status:'806',
                message:'对应系统号不存在'
            }
        }
        try{
            for(let op of reqdata){
                this.ctx.logger.info(op);
                let [result]=await this.app.mysql.query(`select id from t_sys_operation where name=? and system_id=?`,
                    [op.name,syatemId]);
                if(result && result.id){
                    await this.app.mysql.update('t_sys_operation',{...op,id:result.id,type:3,system_id:syatemId});
                }else{
                    await this.app.mysql.insert('t_sys_operation',{...op,type:3,system_id:syatemId});
                }
            }

            return {
                status:'801',
                message:'同步成功'
            }
        }catch (e){
         // 一定记得捕获异常后回滚事务！！
            this.ctx.logger.error(e);
            return {
                status:'806',
                message:'失败'
            }
        }
    }

    async synuserresult(body){
        const {system,reqdata:[{status,username,msg}]}=body;

        let [systementity]=await this.app.mysql.query(`select * from t_system where code=?`,[system.toLowerCase()]);
        let [user]=await this.app.mysql.query(`select * from t_user where user_name=?`,[username]);
        if(!systementity || !user){
            return {
                status:'806',
                message:`对应系统号${system}或对应用户${username}不存在`
            }
        }
        setTimeout(()=>{
            for(let i=0;i<this.app.SynOrCancelResult.length;i++){
                if(this.app.SynOrCancelResult[i].assigneeName===`${username}${system}apply`
                    && this.app.SynOrCancelResult[i].type===`invoke`){
                    this.app.SynOrCancelResult[i].type=`result`;
                    this.app.SynOrCancelResult[i].opType=`apply`;
                    this.app.SynOrCancelResult[i].status=status;
                    this.app.SynOrCancelResult[i].systemName=systementity.name;
                    break;
                }
            }
        },5000);
        if(status==='801'){
            //增加用户访问对应平台权限
            await this._addsysPromision(systementity,user);
        }
        return {
            status:'801',
            message:`success`
        }
    }

    async canceluserresult(body){
        const {system,reqdata:[{status,username,msg}]}=body;
        setTimeout(()=>{
            for(let i=0;i<this.app.SynOrCancelResult.length;i++){
                if(this.app.SynOrCancelResult[i].assigneeName===`${username}${system}cancel`
                    && this.app.SynOrCancelResult[i].type===`invoke`){
                    this.app.SynOrCancelResult[i].type=`result`;
                    this.app.SynOrCancelResult[i].opType=`cancel`;
                    this.app.SynOrCancelResult[i].status=status;
                    break;
                }
            }
        },5000);
        let [systementity]=await this.app.mysql.query(`select * from t_system where code=?`,[system.toLowerCase()]);
        let [user]=await this.app.mysql.query(`select * from t_user where user_name=?`,[username]);
        if(!systementity || !user){
            return {
                status:'806',
                message:`对应系统号${system}或对应用户${username}不存在`
            }
        }

        if(status==='801'){
            //取消用户访问对应平台权限
            await this.app.mysql.query(`delete from t_user_system where user_id=? and system_id=?`,[user.id,systementity.id]);
        }
        return {
            status:'801',
            message:`success`
        }
    }

    async _addsysPromision(system,user){
        let [{count}]=await this.app.mysql.query('select count(1) count from t_user_system where user_id=? and system_id=?',[user.id,system.id]);
        if(count===0){
            this.app.mysql.insert('t_user_system', {user_id:user.id,system_id:system.id});
        }
    }

    randomString(len) {
        len = len || 32;
        var $chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678';    /****默认去掉了容易混淆的字符oOLl,9gq,Vv,Uu,I1****/
        var maxPos = $chars.length;
        var pwd = '';
        for (let i = 0; i < len; i++) {
            pwd += $chars.charAt(Math.floor(Math.random() * maxPos));
        }
        return pwd;
    }

}

module.exports = InterfaceService;