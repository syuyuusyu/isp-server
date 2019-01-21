const Service = require('egg').Service;

class InterfaceService extends Service {

    async verifications(body) {

        let {system, reqdata: [{token}]} = body;
        system = system.toLowerCase();
        let user = await this.service.authorService.getByCode(token);
        if (!user) {
            user = await this.service.authorService.getByCode(token + system);
            if (!user) {
                this.ctx.logger.info('令牌token无效');
                return {
                    status: '806',
                    message: '令牌token无效'
                };
            } else {
                this.app.redis.del(token + system);
                if (!await this.service.redis.containKey(user.user_name + 'loginSystem')) {
                    await this.service.redis.set(user.user_name + 'loginSystem', []);
                }

                await this.ctx.service.redis.push(user.user_name + 'loginSystem', system);
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
                    let currentId = result.id;
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

    async synrole(body) {
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
                this.app.logger.info(system + r.rolename);
                let [result] = await this.app.mysql.query(`select id from t_role where code=?`, [system + r.rolename]);
                this.app.logger.info(result);
                if (result) {
                    let currentId = result.id;
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
        const {version, reqdata: [{domain, path: path}]} = body;
        if (version == 'v2' || version == 'V2') {
            return await this.keyverifyV2();
        }

        let codes = await this.service.redis.get(domain);
        //this.ctx.logger.info('接口权限认证:codes',codes);
        if (codes && codes.filter(c => {
                let rep = /(?:\{)\w+(?:\})/;
                let a = c.replace(rep, (w, p) => {
                    return '.*?'
                });
                return new RegExp(a).test(path);
            }).length > 0) {
            return {
                status: '801',
                message: `成功`,
            }
        } else {
            return {
                status: '806',
                message: `没有访问权限`,
            }
        }
    }

    async keyverify_token(){
        let {system} = this.ctx.request.body;
        system = system.toLocaleLowerCase();
        let token = await this.service.redis.get(`keyverify_token_${system}`);
        if(!token){
            let sys = await this.app.mysql.get('t_system',{code:system});
            token=sys['keyverify_token'];
        }
        if(token){
            return {
                status: '801',
                message: '成功',
                respdata: [
                    {
                        keyid: token,
                    }
                ]
            };
        }else{
            return {
                status: '806',
                message: '获取token失败',
                respdata: [
                    {
                        token: '',
                    }
                ]
            };
        }

    }

    async keyverifyV2() {
        let {system, reqdata: [{ path, token,keyid}]} = this.ctx.request.body;
        if (!keyid && token){
            keyid=token
        }
        let now = new Date();
        let newStr = `${now.getFullYear()}${now.getMonth()}${now.getDay()}${now.getHours()}${now.getMinutes()}${now.getSeconds()}${now.getMilliseconds()}`;
        system = system.toLocaleLowerCase();

        let operations = await this.service.redis.get(keyid);
        console.log(operations);
        if(!operations){
            return {
                "message": "token失效",
                "servertime": newStr,
                "status": "807"
            }
        }
        let codes = operations.filter(o=>o.code == system).map(o=>o.path);
        if (codes && codes.filter(c => {
                let rep = /(?:\{)\w+(?:\})/;
                let a = c.replace(rep, (w, p) => {
                    return '.*?'
                });
                return new RegExp(a).test(path);
            }).length > 0) {
            return {
                "message": "成功",
                "servertime": newStr,
                "status": "801"
            }
        } else {
            return {
                "message": "没有访问权限",
                "servertime": newStr,
                "status": "806"
            }
        }

    }

    async metadata(body) {
        const {system, reqdata} = body;
        //const syatemId=this.app.systemMap[system.toLowerCase()];
        const syatemId = await this.ctx.service.redis.getProperty('systemMap', system.toLowerCase());
        if (!syatemId) {
            return {
                status: '806',
                message: '对应系统号不存在'
            }
        }
        this.ctx.logger.info(syatemId);
        this.ctx.logger.info(reqdata);
        const conn = await this.app.mysql.beginTransaction(); // 初始化事务
        try {
            for (let metdata of reqdata) {
                let fields = metdata.fields;
                delete metdata.fields;
                let [met] = await conn.query(`select id from t_metadata where name=? and system_id=?`, [metdata.name, syatemId]);
                if (met && met.id) {
                    await conn.update('t_metadata', {...metdata, id: met.id, system_id: syatemId})
                    await conn.delete('t_metadata_fields', {metadata_id: met.id});
                    for (let field of fields) {
                        await conn.insert('t_metadata_fields', {...field, metadata_id: met.id})
                    }
                } else {
                    let result = await  conn.insert('t_metadata', {...metdata, system_id: syatemId})
                    await conn.delete('t_metadata_fields', {metadata_id: result.insertId});
                    for (let field of fields) {
                        await conn.insert('t_metadata_fields', {...field, metadata_id: result.insertId})
                    }
                }
            }
            await conn.commit();
            return {
                status: '801',
                message: '同步成功'
            }
        } catch (e) {
            await conn.rollback(); // 一定记得捕获异常后回滚事务！！
            this.ctx.logger.error(e);
            return {
                status: '806',
                message: '同步失败'
            }
        }
    }

    async push_interface(body) {
        const {system, reqdata} = body;
        //const syatemId=this.app.systemMap[system.toLowerCase()];
        const syatemId = await this.ctx.service.redis.getProperty('systemMap', system.toLowerCase());
        if (!syatemId) {
            return {
                status: '806',
                message: '对应系统号不存在'
            }
        }
        try {
            for (let op of reqdata) {
                this.ctx.logger.info(op);
                let [result] = await this.app.mysql.query(`select id from t_sys_operation where method=? and path=? and system_id=?`,
                    [op.method,op.path, syatemId]);
                if (result && result.id) {
                    let resultUpdate = await this.app.mysql.update('t_sys_operation', {
                        ...op,
                        id: result.id,
                        type: 3,
                        system_id: syatemId
                    });
                } else {
                    await this.app.mysql.insert('t_sys_operation', {...op, type: 3, system_id: syatemId});
                }
            }

            return {
                status: '801',
                message: '同步成功'
            }
        } catch (e) {
            // 一定记得捕获异常后回滚事务！！
            this.ctx.logger.error(e);
            return {
                status: '806',
                message: '同步失败'
            }
        }
    }

    async synuserresult(body) {
        let {system, reqdata: [{status, username, msg}]} = body;
        system = system.toLowerCase();
        this.app.logger.info('synuserresult');

        let [systementity] = await this.app.mysql.query(`select * from t_system where code=?`, [system.toLowerCase()]);
        let [user] = await this.app.mysql.query(`select * from t_user where user_name=?`, [username]);
        if (!systementity || !user) {
            return {
                status: '806',
                message: `对应系统号${system}或对应用户${username}不存在`
            }
        }

        let isOk = false;
        if (status === '801') {
            //增加用户访问对应平台权限
            isOk = true;
            await this._addsysPromision(systementity, user);
        }
        this.app.messenger.sendToAgent('rabbitmqMsg', {
            assigneeName: `${username}${system}apply`,
            message: isOk ? `申请${systementity.name}权限成功` : `申请${systementity.name}权限失败,对方平台拒绝申请`,
            count: 0,
            type: 'complate',
        });
        return {
            status: '801',
            message: `success`
        }
    }

    async canceluserresult(body) {
        let {system, reqdata: [{status, username, msg}]} = body;
        system = system.toLowerCase();

        let [systementity] = await this.app.mysql.query(`select * from t_system where code=?`, [system.toLowerCase()]);
        let [user] = await this.app.mysql.query(`select * from t_user where user_name=?`, [username]);

        if (!systementity || !user) {
            return {
                status: '806',
                message: `对应系统号${system}或对应用户${username}不存在`
            }
        }

        let isOk = false;
        if (status === '801') {
            //取消用户访问对应平台权限
            isOk = true;
            await this.app.mysql.query(`delete from t_user_system where user_id=? and system_id=?`, [user.id, systementity.id]);
        }
        this.app.messenger.sendToAgent('rabbitmqMsg', {
            assigneeName: `${username}${system}cancel`,
            message: isOk ? `申请注销${systementity.name}权限成功` : `申请注销${systementity.name}权限失败,对方平台拒绝注销`,
            count: 0,
            type: 'complate',
        });
        return {
            status: '801',
            message: `success`
        }
    }

    async department(body) {
        let departments = await this.app.mysql.query(
            `select id,parent_id parentId,name,parent_name parentName from t_organization where stateflag=1`);
        for (let i = 0; i < departments.length; i++) {
            departments[i].users = [];
            if (departments[i].orgUser) {
                let users = await this.app.mysql.query(`select user_name userName,name from t_user where id in(?)`, [departments[i].orgUser.split(',')]);
                users.forEach(u => departments[i].users.push(u));

            }
            delete departments[i].orgUser;
        }
        return {
            status: '801',
            message: '成功',
            respdata: departments
        }
    }

    async message(body) {
        let [{users, message}] = body.reqdata;
        const activitiIp = this.app.config.self.activitiIp;
        const json = await this.app.curl(`${activitiIp}/repository/process-definitions`, {
            method: 'GET',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json;charset=UTF-8',
            },
            dataType: 'json',
        });
        let process = json.data.data.find(p => p.key === 'message' && !p.suspended);
        console.log(process);
        if (!process) {
            return {
                status: '806',
                message: '失败,消息流未启动',
            }
        }
        users.forEach(async user => {
            let startResult = await this.app.curl(`${activitiIp}/runtime/process-instances`,
                {
                    method: 'POST',
                    data: {
                        processDefinitionId: process.id,
                        businessKey: `message-${user}`,
                        variables: [
                            {
                                name: "applyUser",
                                value: user
                            }, {
                                name: 'message',
                                value: message
                            }
                        ]
                    },
                    headers: {
                        "Accept": "application/json",
                        "Content-Type": "application/json;charset=UTF-8"
                    },
                    dataType: 'json',
                });
            console.log(startResult);
        });
        return {
            status: '801',
            message: '成功',
        }
    }

    async service_tree(){
        return await this.app.mysql.query(`select * from t_service_tree `);
    }

    async _addsysPromision(system, user) {
        let [{count}] = await this.app.mysql.query('select count(1) count from t_user_system where user_id=? and system_id=?', [user.id, system.id]);
        if (count === 0) {
            this.app.mysql.insert('t_user_system', {user_id: user.id, system_id: system.id});
        }
    }

    randomString(len) {
        len = len || 32;
        var $chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678';
        /****默认去掉了容易混淆的字符oOLl,9gq,Vv,Uu,I1****/
        var maxPos = $chars.length;
        var pwd = '';
        for (let i = 0; i < len; i++) {
            pwd += $chars.charAt(Math.floor(Math.random() * maxPos));
        }
        return pwd;
    }
}

module.exports = InterfaceService;





