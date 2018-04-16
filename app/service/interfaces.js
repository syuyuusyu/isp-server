const Service = require('egg').Service;

class InterfaceService extends Service {

    async verifications(body) {
        const {system, reqdata: [{token}]} = body;
        let author = await this.service.authorService.getByCode(token);
        if(!author){
            author = await this.service.authorService.getByCode(token + system);
            if (!author) {
                return {
                    status: '806',
                    message: '令牌token无效'
                };
            } else {
                this.app.redis.del(token + system);
                this.app.loginSystem.push(system);
                return {
                    status: '801',
                    message: '成功',
                    respdata: [
                        {
                            username: author.user.user_name,
                        }
                    ]
                };
            }
        }

        this.app.redis.del(token);
        return {
            status: '801',
            message: '成功',
            respdata: [
                {
                    username: author.user.user_name,
                }
            ]
        };


    }

    async synuser(body) {
        let {system, reqdata: users} = body;
        system = system.toLocaleLowerCase();
        let [sysEntity] = await this.app.mysql.query(`select * from isp_system where code=?`, [system]);
        if (!sysEntity) {
            return {
                status: '806',
                message: `对应系统编码:${system},不存在`,
            }
        }
        try {
            for (let u of users) {
                let [result] = await this.app.mysql.query(`select id from isp_user where phone=?`, [system + u.username]);
                if (result) {
                    let currentId=result.id;
                    await this.app.mysql.update('isp_user',
                        {
                            id: currentId,
                            system_id: sysEntity.id,
                            user_name: system + u.username,
                            name: u.name,
                            type: '1'
                        });
                } else {
                    const Literal = this.app.mysql.literals.Literal;
                    await this.app.mysql.insert('isp_user',
                        {
                            system_id: sysEntity.id, type: '1',
                            user_name: system + u.username, name: u.name, passwd: new Literal(`password('123456')`)
                        });
                }
            }
        } catch (e) {
            this.app.logger.error(new Error('同步用户接口错误'), e);
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
        let [sysEntity] = await this.app.mysql.query(`select * from isp_system where code=?`, [system]);
        if (!sysEntity) {
            return {
                status: '806',
                message: `对应系统编码:${system},不存在`,
            }
        }
        try {
            for (let r of roles) {
                console.log(system + r.rolename);
                let [result] = await this.app.mysql.query(`select id from isp_role where code=?`, [system + r.rolename]);
                console.log(result);
                if (result) {
                    let currentId=result.id;
                    await this.app.mysql.update('isp_role',
                        {
                            id: currentId,
                            system_id: sysEntity.id,
                            code: system + r.rolename,
                            name: r.name,
                            type: '1'
                        });
                } else {
                    await this.app.mysql.insert('isp_role',
                        {
                            system_id: sysEntity.id, type: '1',
                            code: system + r.rolename, name: r.name,
                        });
                }
            }
        } catch (e) {
            console.log(e);
            this.app.logger.error(new Error('同步角色接口错误'), e);
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
        console.log(domain);
        let codes=await this.service.authorService.getByCode(domain);
        if(codes.filter(c=>c===path).length>0){
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
        this.app.logger.info(syatemId);
        this.app.logger.info(reqdata);
        const conn = await this.app.mysql.beginTransaction(); // 初始化事务
        try{
            for(let metdata of reqdata){
                let fields=metdata.fields;
                delete metdata.fields;
                let [{id}]=await conn.query(`select id from isp_metadata where name=? and system_id=?`,[metdata.name,syatemId]);
                if(id){
                    await conn.update('isp_metadata',{...metdata,id:id,system_id:syatemId})
                    await conn.delete('isp_metadata_fields',{metadata_id:id});
                    for (let field of fields){
                        await conn.insert('isp_metadata_fields',{...field,metadata_id:id})
                    }
                }else{
                    let result=await  conn.insert('isp_metadata',{...metdata,system_id:syatemId})
                    await conn.delete('isp_metadata_fields',{metadata_id:result.insertId});
                    for (let field of fields){
                        await conn.insert('isp_metadata_fields',{...field,metadata_id:result.insertId})
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
            this.app.logger.error(e);
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
                let [{id}]=await this.app.mysql.query(`select id from isp_sys_operation where name=? and system_id=?`,
                    [op.name,syatemId]);
                if(id){
                    await conn.update('isp_metadata',{...op,id:id});
                }else{
                    await conn.insert('isp_metadata',{op});
                }
            }
            await conn.commit();
            return {
                status:'801',
                message:'同步成功'
            }
        }catch (e){
            await conn.rollback(); // 一定记得捕获异常后回滚事务！！
            this.app.logger.error(e);
            return {
                status:'806',
                message:'失败'
            }
        }
    }

    async synuserresult(body){
        const {system,reqdata:[{status,username,msg}]}=body;
        let [systementity]=await this.app.mysql.query(`select * from isp_system where code=?`,[system.toLowerCase()]);
        let [user]=await this.app.mysql.query(`select * from isp_user where user_name=?`,[username]);
        if(!systementity || !user){
            return {
                status:'806',
                message:`对应系统号${system}或对应用户${username}不存在`
            }
        }
        const message_ok=`${user.name}申请访问:${systementity.name}访问权限已获${systementity.name}批准,已经可以访问该平台`;
        const message_err=`${user.name}申请访问:${systementity.name}访问权限不通过,原因:${msg}`;
        let message={
            receive_type:2,
            message_type:2,
            receive_role_id:19,
            create_time:this.app.mysql.literals.now,
            step:1,
            send_user_name:'系统信息'
        };
        if(status==='801'){
            this.service.message.save({...message,message:message_ok});
            this.service.message.save({...message,message:message_ok,receive_type:1,receive_user_id:user.id,receive_role_id:undefined});
            //增加用户访问对应平台权限
            this._addsysPromision(systementity,user);
        }else{
            this.service.message.save({...message,message:message_err});
            this.service.message.save({...message,message:message_err,receive_type:1,receive_user_id:user.id,receive_role_id:undefined});
        }
        return {
            status:'801',
            message:`success`
        }
    }

    async _addsysPromision(system,user){
        let [{count}]=await this.app.mysql.query('select count(1) count from isp_user_system where user_id=? and system_id=?',[user.id,system.id]);
        console.log('_addsysPromision',count);
        if(count===0){
            this.app.mysql.insert('isp_user_system', {user_id:user.id,system_id:system.id});
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