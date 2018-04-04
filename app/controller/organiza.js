const Controller=require('egg').Controller;

class OrganizationController extends Controller{
    async orgMenu(){
 /*       let menu=await this.app.mysql.select('isp_organization',{
            where:{
                parent_id:this.ctx.params.id
            }
        });*/
        let menu=await this.app.mysql.query('select * from isp_organization where parent_id=? /*and parent_id<>?*/',[this.ctx.params.id]);
        this.ctx.body=menu;
    }

    async currentOrgs(){
        let orgs=await this.app.mysql.select('isp_organization',{
            where:{
                parent_id:this.ctx.params.orgId
            }
        });
        this.ctx.body=orgs;
    }

    async currentOrgIsLeaf(){
        let org=await this.app.mysql.select('isp_organization',{
            where:{
                id:this.ctx.params.orgId
            }
        })
        console.log("currentOrgIsLeaf的值为：");
        console.log(org);
        this.ctx.body=org;
    }

    async currentDetailedOrg(){
        let detailedOrg=await this.app.mysql.select('isp_org_detailed',{
            where:{
                id:this.ctx.params.id
            }
            }
        );
        this.ctx.body=currentDetailedOrg;
    }

    async save(){
        const entity=this.ctx.request.body;
        console.log(entity);
        let result={};
        if(entity.id){
            result = await this.app.mysql.update('isp_organization', entity);
        }/*else {
            result = await this.app.mysql.insert('isp_organization', {entity,is_detailed:1}); // 更新 posts 表中的记录
        }*/
        // 判断更新成功
        console.log(result);
        const updateSuccess = result.affectedRows === 1;
        this.ctx.body={success:updateSuccess};
    }

    async saveAdd(){
        const entity=this.ctx.request.body;

        if(entity.is_leaf==1){
            await this.app.mysql.query('update isp_organization set is_leaf=? where id=?',[0,entity.parent_id]);
        }

        let result={};
        const insert=await this.app.mysql.insert('isp_organization',entity);
        if(insert.insertId){
        const newPath=entity.path+'-'+insert.insertId;
        result=await this.app.mysql.query('update isp_organization set is_leaf=?,path=?  where id=?',[1,newPath,insert.insertId]);
        const insertSuccess=result.affectedRows === 1;
        this.ctx.body={success:insertSuccess};}
    }

    async delete(){
        const resultAccept=await this.app.mysql.select('isp_organization',{
            where:{
                id:this.ctx.params.id
            }
        });
        console.log("resultAccept的值为：");
        console.log(resultAccept[0]);

         if(resultAccept[0].parent_id){
             await this.app.mysql.query('update isp_organization set is_leaf=? where parent_id=?',[1,resultAccept[0].parent_id]);
         }
         if(resultAccept[0].path){
             const result=await this.app.mysql.query(`delete from isp_organization where path like '${resultAccept[0].path}%'`);
             console.log("result的值为：",result);
             //const updateSuccess = result.affectedRows === 1;
             this.ctx.body={success:true};
         }


    }}



module.exports=OrganizationController;