const Service=require('egg').Service;

class OrganizationService extends Service{
     async loadOraganizationForm(current,roles){
         let organizationFroms=await this.app.mysql.query(`select id orgId,name  from isp_organization`);
         for(let i=0;i<organizationFroms.length;i++){
             organizationFroms[i].id=organizationFroms[i].orgId+'-'+current.id;
             organizationFroms[i].path='/org_operation/'+ organizationFroms[i].orgId;
             organizationFroms[i].page_path='orgOperation';
             organizationFroms[i].page_class='OrgOpetation';
         }
         return organizationFroms;
     }
}