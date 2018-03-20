const Controller=require('egg').Controller;

class SystemController extends Controller{
    async allSystem(){
        let content=await this.app.mysql.query('select * from isp_system',[]);
        this.ctx.body=content;
    }

    async checkUnique(){
        let [{total}]=await this.app.mysql.query('select count(1) total from isp_system where code=?' ,[this.ctx.params.code]);
        this.ctx.body={total}
    }

    async save(){
        const entity=this.ctx.request.body;
        let result={};
        if(entity.id){
            result = await this.app.mysql.update('isp_system', entity);
        }else {
            result = await this.app.mysql.insert('isp_system', entity); // 更新 posts 表中的记录
        }
        // 判断更新成功
        const updateSuccess = result.affectedRows === 1;
        this.ctx.body={success:updateSuccess};
    }

    async delete(){
        const result = await this.app.mysql.delete('isp_system', {
            id: this.ctx.params.id
        });
        const updateSuccess = result.affectedRows === 1;
        this.ctx.body={success:updateSuccess};
    }

    async currentSys(){
        let content=await this.app.mysql.query('select * from isp_system where id=?',[this.ctx.params.id]);
        this.ctx.body=content;
    };

    async sysRole(){
        let roles=await this.app.mysql.query(`select r.* from isp_role r join isp_sys_role sr on r.id=sr.role_id where sr.system_id=?`,
            [this.ctx.params.sysId])
        this.ctx.body=roles;
    }

    async saveSysRole(){
        const {sysId,roleIds}=this.ctx.request.body;

        let result;
        const conn = await this.app.mysql.beginTransaction(); // 初始化事务

        try {
            await conn.delete('isp_sys_role', {
                system_id: sysId,
            });  // 第一步操作
            if(roleIds.length>0){
                let sql=`insert into isp_sys_role(system_id,role_id) values ${roleIds.map((a)=>'('+sysId+','+a+')').reduce((a,b)=>a+','+b)}`;
                result=await conn.query(sql);  // 第二步操作
            }

            await conn.commit(); // 提交事务
        } catch (err) {
            await conn.rollback(); // 一定记得捕获异常后回滚事务！！
            throw err;
        }
        const updateSuccess = roleIds.length===0 || result.affectedRows === roleIds.length;
        this.ctx.body={success:updateSuccess};

    }

    async currentRoleSys(){
        let sql=`select s.* from isp_system s join isp_sys_role rs on rs.system_id=s.id where rs.role_id in (?) order by s.id`;
        const token =this.ctx.request.header['access-token'];
        const auth=await this.service.authorService.getAuthor(token);
        const roles=auth.roles;
        const systems=await this.app.mysql.query(sql,[roles.map(r=>r.id)]);
        auth.systems=[];
        for(let i=0;i<systems.length;i++){
            const operations=await this.app.mysql.query(`select * from isp_sys_operation where system_id=?`,systems[i].id);
            let loginToken=randomString(8);
            this.app.redis.set(loginToken+systems[i].code,JSON.stringify(auth));
            systems[i].operations=operations;
            auth.systems.push(systems[i]);
            systems[i].token=loginToken;

        }
        this.app.redis.set(token,JSON.stringify(auth));
        console.log(auth);
        auth.systems.forEach(sys=>{
           console.log(sys.url);
           console.log(sys.operations.length);
        });
        this.ctx.body=systems;
    }
}

function randomString(len) {
    len = len || 32;
    var $chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678';    /****默认去掉了容易混淆的字符oOLl,9gq,Vv,Uu,I1****/
    var maxPos = $chars.length;
    var pwd = '';
    for (i = 0; i < len; i++) {
        pwd += $chars.charAt(Math.floor(Math.random() * maxPos));
    }
    return pwd;
}

module.exports= SystemController;

