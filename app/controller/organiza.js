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
        let result={};
        if(entity.id){
            result = await this.app.mysql.update('isp_organization', entity);
        }/*else {
            result = await this.app.mysql.insert('isp_organization', {entity,is_detailed:1}); // 更新 posts 表中的记录
        }*/
        // 判断更新成功
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
        //查询要删除的节点的父节点有几个子节点，如果只有一个子节点（即要删除的节点），那么将父节点的is_leaf置为1
        if(resultAccept[0].parent_id){
            const resultParentId= await this.app.mysql.select('isp_organization',{
                where:{
                    parent_id:resultAccept[0].parent_id
                }
            });
            if(resultParentId.length==1){
                await this.app.mysql.query('update isp_organization set is_leaf=? where id=?',[1,resultAccept[0].parent_id]);
            }
        }
         /*if(resultAccept[0].parent_id){
             await this.app.mysql.query('update isp_organization set is_leaf=? where parent_id=?',[1,resultAccept[0].parent_id]);
         }*/
         if(resultAccept[0].path){
             const result=await this.app.mysql.query(`delete from isp_organization where path like '${resultAccept[0].path}%'`);
             //const updateSuccess = result.affectedRows === 1;
             this.ctx.body={success:true};
         }


    }}



module.exports=OrganizationController;
