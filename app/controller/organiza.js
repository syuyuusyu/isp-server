const Controller = require('egg').Controller;

class OrganizationController extends Controller {
  async orgMenu() {
    /*       let menu=await this.app.mysql.select('t_organization',{
               where:{
                   parent_id:this.ctx.params.id
               }
           });*/
    let menu = await this.app.mysql.query('select * from t_organization where parent_id=? /*and parent_id<>?*/', [this.ctx.params.id]);
    this.ctx.body = menu;
  }

  async currentOrgs() {
    let orgs = await this.app.mysql.select('t_organization', {
      where: {
        parent_id: this.ctx.params.orgId
      }
    });
    this.ctx.body = orgs;
  }

  async currentOrgIsLeaf() {
    let org = await this.app.mysql.select('t_organization', {
      where: {
        id: this.ctx.params.orgId
      }
    })
    this.ctx.body = org;
  }

  async currentDetailedOrg() {
    let detailedOrg = await this.app.mysql.select('t_org_detailed', {
        where: {
          id: this.ctx.params.id
        }
      }
    );
    this.ctx.body = currentDetailedOrg;
  }

  async save() {
    let entity = this.ctx.request.body;
    let token = this.ctx.request.header['access-token'];
    let sd = await this.service.authorService.getAuthor(token);
    let logoinUser = sd.user.user_name;
    entity.update_by=logoinUser;
    entity.update_time=new Date();
    let result = {};
    if (entity.id) {
      result = await this.app.mysql.update('t_organization', entity);
    }
    /*else {
                result = await this.app.mysql.insert('t_organization', {entity,is_detailed:1}); // 更新 posts 表中的记录
            }*/
    // 判断更新成功
    const updateSuccess = result.affectedRows === 1;
    this.ctx.body = {success: updateSuccess};
  }

  async saveAdd() {
    const entity = this.ctx.request.body;
    let token = this.ctx.request.header['access-token'];
    let sd = await this.service.authorService.getAuthor(token);
    let logoinUser = sd.user.user_name;

    if (entity.is_leaf == 1) {
      await this.app.mysql.query('update t_organization set is_leaf=?,update_by=?,update_time=? where id=?', [0,logoinUser,new Date(),entity.parent_id]);
    }

    let result = {};
    const insert = await this.app.mysql.insert('t_organization', entity);
    if (insert.insertId) {
      const newPath = entity.path + '-' + insert.insertId;
      result = await this.app.mysql.query('update t_organization set is_leaf=?,path=?,update_by=?,update_time=? where id=?', [1, newPath,logoinUser,new Date(),insert.insertId]);
      const insertSuccess = result.affectedRows === 1;
      this.ctx.body = {success: insertSuccess};
    }
  }

  async delete() {
    const resultAccept = await this.app.mysql.select('t_organization', {
      where: {
        id: this.ctx.params.id
      }
    });
    //查询要删除的节点的父节点有几个子节点，如果只有一个子节点（即要删除的节点），那么将父节点的is_leaf置为1
    if (resultAccept[0].parent_id) {
      const resultParentId = await this.app.mysql.select('t_organization', {
        where: {
          parent_id: resultAccept[0].parent_id
        }
      });
      if (resultParentId.length == 1) {
        await this.app.mysql.query('update t_organization set is_leaf=? where id=?', [1, resultAccept[0].parent_id]);
      }
    }
    /*if(resultAccept[0].parent_id){
        await this.app.mysql.query('update t_organization set is_leaf=? where parent_id=?',[1,resultAccept[0].parent_id]);
    }*/
    if (resultAccept[0].path) {
      const result = await this.app.mysql.query(`delete from t_organization where path like '${resultAccept[0].path}%'`);
      //const updateSuccess = result.affectedRows === 1;
      this.ctx.body = {success: true};
    }
  }

  async getAllUser() {
    let content = await this.app.mysql.query('select * from t_user where stateflag=1 order by id asc', []);
    this.ctx.body = content;
  }

  async getQueryUser() {
    const value = this.ctx.params.value;
    let content = await this.app.mysql.query(`select * from t_user where user_name like '%${value}%' or name like '%${value}%' or phone like '%${value}%'`);
    this.ctx.body = content;

  }

  async getSelectedRowKeys() {
    const id = this.ctx.params.id;
    let content = await this.app.mysql.query('select * from t_organization where id=?', [id]);
    this.ctx.body = content;
  }

  async saveOrgUser() {
    const {selectedRowKeys, selectOrgid} = this.ctx.request.body;
    let token = this.ctx.request.header['access-token'];
    let sd = await this.service.authorService.getAuthor(token);
    let logoinUser = sd.user.user_name;
    //获取前端选中机构的机构信息
    let orgInfo = await this.app.mysql.query('select * from t_organization where id=?', [selectOrgid]);
    let orgUser = orgInfo[0].orgUser;//此机构所关联的用户的id
    orgUser = orgUser.split(',');//将orgUser转成数组，selectedRowKeys是在弹窗中选定的用户，orgUser是之前已经有的用户
    if(orgUser.toString()===''){
      orgUser.length=0;
    }
    let differenceA = orgUser.concat(selectedRowKeys).filter(v => !orgUser.includes(v));//selectedRowKeys对orgUser的差集（说明有新的用户关联到选择的机构）
    let differenceB = orgUser.concat(selectedRowKeys).filter(v => !selectedRowKeys.includes(v));//orgUser对selectedRowKeys的差集（说明有的用户已不再关联到选择的机构）
    //console.log("selectedRowKeys, orgUser,differenceA, differenceB, differenceA.length, differenceB.length的值为:", selectedRowKeys, orgUser,differenceA, differenceB, differenceA.length, differenceB.length);
    //将机构关联的所有用户的id存入t_organization表中
    const row = {
      orgUser: selectedRowKeys.join(','),
      update_by: logoinUser,
      update_time: new Date(),
    };
    const options = {
      where: {
        id: selectOrgid
      }
    };
    let result = await this.app.mysql.update('t_organization', row, options);
    const updateSuccess = result.affectedRows === 1;//判断更新是否成功
    if (updateSuccess === true) {
      //如果selectedRowKeys为空orgUser不为空说明以前关联此机构的用户已不再关联此机构，从用户表中将相关的用户的此机构去掉
      if (selectedRowKeys.length === 0 && orgUser.length !== 0) {
        for (const orgUserValue of orgUser) {
          let userInfo = await this.app.mysql.query('select * from t_user where id=?', orgUserValue)
          const organizationId = userInfo[0].organization_id;
          const newOrganizationId = organizationId.replace(selectOrgid + ',', '');
          //console.log("organizationId,NewOrganizationId的值为:",organizationId,newOrganizationId)
          await this.app.mysql.query('update t_user set organization_id=?,update_by=?,update_time=? where id=?', [newOrganizationId, logoinUser, new Date(), orgUserValue]);
        }
      } else {
        if (differenceB.length !== 0) {
          //在用户表中的不再关联此机构的用户的organization_id字段中除去此机构的id
          //console.log("进入differenceB")
          for (const deleteOrgOfUserId of differenceB) {
            let userInfo = await this.app.mysql.query('select * from t_user where id=?', deleteOrgOfUserId);
            const organizationId = userInfo[0].organization_id;
            const newOrganizationId = organizationId.replace(selectOrgid + ',', '');
            await this.app.mysql.query('update t_user set organization_id=?,update_by=?,update_time=? where id=?', [newOrganizationId, logoinUser, new Date(), deleteOrgOfUserId]);
          }
        }
        if (differenceA.length!==0) {
          //console.log("进入differenceA")
          for (const addOrgOfUserId of differenceA) {
            //在用户表中的新关联此机构的用户的organization_id字段中增加此机构的id
            let userInfo = await this.app.mysql.query('select * from t_user where id=?', addOrgOfUserId);
            const organizationId = userInfo[0].organization_id;
            const newOrganizationId = organizationId + selectOrgid + ',';
            await this.app.mysql.query('update t_user set organization_id=?,update_by=?,update_time=? where id=?', [newOrganizationId, logoinUser, new Date(), addOrgOfUserId]);
          }
        }
      }
    }
    let userInfo=await this.app.mysql.query('select * from t_user',[]);
    //通过在t_user表中机构id的值查询出响应的机构名称，存入t_user表中的机构名称字段
    for(let userInfoValue of userInfo){
      let organizationId=userInfoValue.organization_id;
      if(organizationId!=='') {
        //将查询出的organizationId转为数组
        organizationId=organizationId.split(',');
        //因为organizationId转为数组后，数组的最后一位为''，比如[ '86', '87', '88', '' ] ，因此不对数组的最后一位元素进行遍历
        let orgNames='';//用户所关联的机构名称
        //遍历机构id并通过机构id查询出机构名称
        for(let i=0;i<organizationId.length-1;i++){
          let organizationInfo = await this.app.mysql.query('select * from t_organization where id=?', [organizationId[i]]);
          let orgName=organizationInfo[0].name+';';
          orgNames+=orgName;
        }
        //将机构名称更新至用户表中的机构名称字段
      let result=await this.app.mysql.query('update t_user set organization_name=?,update_by=?,update_time=? where id=?', [orgNames, logoinUser, new Date(), userInfoValue.id]);
      }else{
        //将机构id字段为空的字段中的机构名称字段置空
        let result=await this.app.mysql.query('update t_user set organization_name=?,update_by=?,update_time=? where organization_id=?', ['', logoinUser, new Date(), '']);
      }
    }
    this.ctx.body={success:true};
  }
}

module.exports = OrganizationController;
