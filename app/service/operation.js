const Service=require('egg').Service;

class OperationService extends Service{

    //平台功能配置菜单树
    async loadPlatfrom(current,user,roles){
        let sql=`select s.id sysId,s.name text from t_system s where stateflag=1`;
        //let sql=`select s.id sysId,s.name text from t_system s join t_sys_role rs on rs.system_id=s.id where rs.role_id in (?) order by s.id`
        let platfroms=await this.app.mysql.query(sql,[roles.map(r=>r.id)]);
        for(let i=0;i<platfroms.length;i++){
            platfroms[i].id=platfroms[i].sysId+'-'+current.id;
            platfroms[i].path='/sys_operation/'+platfroms[i].sysId;
            platfroms[i].page_path='sysOperation';
            platfroms[i].page_class='SysOperation';
        }
        return platfroms;
    }

    //平台接口管理菜单树
    async sysInvoke(current,user,roles){
        let platfroms=await this.app.mysql.query(
            `select s.id sysId,s.name text from t_system s where stateflag=1`,
            []);
        for(let i=0;i<platfroms.length;i++){
            platfroms[i].id=platfroms[i].sysId+'-'+current.id;
            platfroms[i].path='/sys_invoke/'+platfroms[i].sysId;
            platfroms[i].page_path='sysInvoke';
            platfroms[i].page_class='InvokeTable';
        }
        return platfroms;
    }

    //保存t_sys_operation
    async save(entity){
        let result={};
        if(entity.id){
            result = await this.app.mysql.update('t_sys_operation', entity);
        }else {
            result = await this.app.mysql.insert('t_sys_operation', entity); // 更新 posts 表中的记录
        }
        // 判断更新成功
        return result.affectedRows === 1;
    }
}

module.exports = OperationService;
