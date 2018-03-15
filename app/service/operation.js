const Service=require('egg').Service;

class OperationService extends Service{

    async loadPlatfrom(current,roles){
        console.log(22222);
        let platfroms=await this.app.mysql.query(`select id sysId,name text from isp_system`);
        for(let i=0;i<platfroms.length;i++){
            platfroms[i].id=platfroms[i].sysId+'-'+current.id;
            platfroms[i].path='/sys_operation/'+platfroms[i].sysId;
            platfroms[i].page_path='sysOperation';
            platfroms[i].page_class='SysOperation';
            //platfroms[i].path_value='/'+platfroms[i].sysId;
            //platfroms[i].path_holder='/:sysId';
        }
        return platfroms;
    }
}

module.exports = OperationService;