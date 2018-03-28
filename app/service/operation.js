const Service=require('egg').Service;

class OperationService extends Service{

    //平台功能配置菜单树
    async loadPlatfrom(current,roles){
        let platfroms=await this.app.mysql.query(
            `select s.id sysId,s.name text from isp_system s 
            join isp_sys_role rs on rs.system_id=s.id where rs.role_id in (?) order by s.id`,
        [roles.map(r=>r.id)]);
        for(let i=0;i<platfroms.length;i++){
            platfroms[i].id=platfroms[i].sysId+'-'+current.id;
            platfroms[i].path='/sys_operation/'+platfroms[i].sysId;
            platfroms[i].page_path='sysOperation';
            platfroms[i].page_class='SysOperation';
        }
        return platfroms;
    }

    //平台接口管理菜单树
    async sysInvoke(current,roles){
        let platfroms=await this.app.mysql.query(
            `select s.id sysId,s.name text from isp_system s 
            join isp_sys_role rs on rs.system_id=s.id where rs.role_id in (?) order by s.id`,
            [roles.map(r=>r.id)]);
        for(let i=0;i<platfroms.length;i++){
            platfroms[i].id=platfroms[i].sysId+'-'+current.id;
            platfroms[i].path='/sys_invoke/'+platfroms[i].sysId;
            platfroms[i].page_path='sysInvoke';
            platfroms[i].page_class='InvokeTable';
        }
        return platfroms;
    }

    //保存isp_sys_operation
    async save(entity){
        let result={};
        if(entity.id){
            result = await this.app.mysql.update('isp_sys_operation', entity);
        }else {
            result = await this.app.mysql.insert('isp_sys_operation', entity); // 更新 posts 表中的记录
        }
        // 判断更新成功
        return result.affectedRows === 1;
    }
}

module.exports = OperationService;