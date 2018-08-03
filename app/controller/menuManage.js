const Controller = require('egg').Controller;

class MenuManage extends Controller {
  async initMenu() {
    let initMenu = await this.app.mysql.query('select * from t_menu where parent_id=? and stateflag=1 order by menu_order', [this.ctx.params.id]);
    this.ctx.body = initMenu;
  }

  async currentMenus() {
    let currentMenus = await  this.app.mysql.query('select * from t_menu where parent_id=? and stateflag=1 order by menu_order', [this.ctx.params.menuId]);
    this.ctx.body = currentMenus;
  }

  async currentMenuIsLeaf() {
    let currentMenus = await  this.app.mysql.query('select * from t_menu where id=? and stateflag=1 order by menu_order', [this.ctx.params.menuId]);
    this.ctx.body = currentMenus;
  }

  async saveAdd() {
    const entity = this.ctx.request.body;
    if (entity.menu_order === '') {
      entity.menu_order = 1000;
    }
    let token = this.ctx.request.header['access-token'];
    let sd = await this.service.authorService.getAuthor(token);
    let logoinUser = sd.user.user_name;
    if (entity.is_leaf == 1) {
      await this.app.mysql.query('update t_menu set is_leaf=? where id=?', [0, entity.parent_id]);
    }
    let result = {};
    const insert = await this.app.mysql.insert('t_menu', entity);
    if (insert.affectedRows === 1) {
      const newPath = entity.menu_path + '-' + insert.insertId;
      result = await this.app.mysql.query('update t_menu set is_leaf=?,menu_path=?,create_by=?,create_time=? where id=?', [1, newPath, logoinUser, new Date(), insert.insertId]);
    }
    const insertSuccess = result.affectedRows === 1;
    this.ctx.body = {success: insertSuccess};
  }

  async saveModify() {
    let entity = this.ctx.request.body;
    if (entity.menu_order === '') {
      entity.menu_order = 1000;
    }
    let token = this.ctx.request.header['access-token'];
    let sd = await this.service.authorService.getAuthor(token);
    let logoinUser = sd.user.user_name;
    entity.update_by = logoinUser;
    entity.update_time = new Date();
    let result = {};
    if (entity.id) {
      result = await this.app.mysql.update('t_menu', entity);
    }
    const updateSuccess = result.affectedRows === 1;
    this.ctx.body = {success: updateSuccess};
  }

  async delete() {
    let token = this.ctx.request.header['access-token'];
    let sd = await this.service.authorService.getAuthor(token);
    let logoinUser = sd.user.user_name;
    //查询出选中要删除菜单的信息
    const menuInfo = await this.app.mysql.query('select * from t_menu where id=? and stateflag=1', [this.ctx.params.id]);
    //查询要删除的节点的父节点有几个子节点，如果只有一个子节点（即要删除的节点），那么将父节点的is_leaf置为1
    if (menuInfo[0].parent_id) {
      const resultParentId = await this.app.mysql.query('select * from t_menu where parent_id=? and stateflag=1', [menuInfo[0].parent_id]);
      if (resultParentId.length === 1) {
        await this.app.mysql.query('update t_menu set is_leaf=? where id=?', [1, menuInfo[0].parent_id])
      }
    }
    //获取要删除菜单的id及其子菜单的id
    const result=await this.ctx.service.saveOrDelete.childList(menuInfo[0].id,'id','parent_id','t_menu');
    console.log("result的值为:",result);


    if (menuInfo[0].menu_path) {
      //获取要删除菜单的id及其子菜单的id
      const getIdResult = await this.app.mysql.query(`select * from t_menu where menu_path like '${menuInfo[0].menu_path}%'`);
      //在菜单权限表中删除相应的配置
      if (getIdResult.length > 0) {
        for (const getIdResultValue of getIdResult) {
          const menuId = getIdResultValue.id;
          await this.app.mysql.query('update t_role_menu set stateflag=0,update_by=?,update_time=? where menu_id=?', [logoinUser,new Date(),menuId]);
        }
      }

      //删除菜单及该菜单下的子菜单
      const result = await this.app.mysql.query(`update t_menu set stateflag=0,update_by=?,update_time=? where menu_path like '${menuInfo[0].menu_path}%'`,[logoinUser,new Date()]);
      const updateSuccess = result.affectedRows >= 1;
      this.ctx.body = {success: updateSuccess};
    }
  }
}

module.exports = MenuManage;
