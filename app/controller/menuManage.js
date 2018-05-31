const Controller = require('egg').Controller;

class MenuManage extends Controller{
  async initMenu(){
    let initMenu=await this.app.mysql.query('select * from t_menu where parent_id=? and stateflag=1 order by menu_order',[this.ctx.params.id]);
    this.ctx.body = initMenu;
  }

  async currentMenus(){
    let currentMenus=await  this.app.mysql.query('select * from t_menu where parent_id=? and stateflag=1 order by menu_order',[this.ctx.params.menuId]);
    this.ctx.body=currentMenus;
  }

  async currentMenuIsLeaf(){
    let currentMenus=await  this.app.mysql.query('select * from t_menu where id=? and stateflag=1 order by menu_order',[this.ctx.params.menuId]);
    this.ctx.body=currentMenus;
  }

  async saveAdd() {
    const entity = this.ctx.request.body;
    if(entity.menu_order===''){
      entity.menu_order=1000;
    }
    let token = this.ctx.request.header['access-token'];
    let sd = await this.service.authorService.getAuthor(token);
    let logoinUser = sd.user.user_name;
    if (entity.is_leaf == 1) {
      await this.app.mysql.query('update t_menu set is_leaf=? where id=?', [0,entity.parent_id]);
    }
    let result = {};
    const insert = await this.app.mysql.insert('t_menu', entity);
    if(insert.affectedRows===1){
      const newPath = entity.menu_path + '-' + insert.insertId;
      result = await this.app.mysql.query('update t_menu set is_leaf=?,menu_path=?,create_by=?,create_time=? where id=?',[1,newPath,logoinUser,new Date(),insert.insertId]);
    }
    const insertSuccess = result.affectedRows === 1;
    this.ctx.body = {success: insertSuccess};
  }

  async saveModify(){
    let entity = this.ctx.request.body;
    if(entity.menu_order===''){
      entity.menu_order=1000;
    }
    let token = this.ctx.request.header['access-token'];
    let sd = await this.service.authorService.getAuthor(token);
    let logoinUser = sd.user.user_name;
    entity.update_by=logoinUser;
    entity.update_time=new Date();
    let result = {};
    if (entity.id) {
      result = await this.app.mysql.update('t_menu', entity);
    }
    const updateSuccess = result.affectedRows === 1;
    this.ctx.body = {success: updateSuccess};
  }

  async delete(){
    //查询出选中要删除菜单的信息
    const menuInfo=await this.app.mysql.query('select * from t_menu where id=? and stateflag=1',[this.ctx.params.id]);
    //查询要删除的节点的父节点有几个子节点，如果只有一个子节点（即要删除的节点），那么将父节点的is_leaf置为1
    if(menuInfo[0].parent_id){
      const resultParentId=await this.app.mysql.query('select * from t_menu where parent_id=? and stateflag=1',[menuInfo[0].parent_id]);
      if(resultParentId.length===1){
        await this.app.mysql.query('update t_menu set is_leaf=? where id=?',[1,menuInfo[0].parent_id])
      }
    }
    if(menuInfo[0].menu_path){
      const result= await this.app.mysql.query(`update t_menu set stateflag=0 where menu_path like '${menuInfo[0].menu_path}%'`);
      const updateSuccess = result.affectedRows >= 1;
      this.ctx.body = {success: updateSuccess};
    }
  }
}
module.exports = MenuManage;
