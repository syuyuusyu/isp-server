const Controller = require('egg').Controller;

class RoleController extends Controller {

  async allRoles() {
    // let roleType=this.ctx.params.roleType;
    // let sql=`select r.*,s.name sname from t_role r JOIN t_system s on r.system_id=s.id where r.type=1`;
    // if(roleType==='2'){
    //     sql=`select * from t_role where type=2`;
    // }
    const sql = 'select * from t_role where stateflag=1';
    const content = await this.app.mysql.query(sql, []);
    this.ctx.body = content;
  }


  async codeUnique() {
    const { value, systemId } = this.ctx.request.body;
    if ((value + '').trim() === '') {
      this.ctx.body = { total: 1 };
      return;
    }
    const [{ total }] = await this.app.mysql.query('select count(1) total from t_role where code=? and system_id=? and stateflag=1'
      , [ value, systemId ]);
    this.ctx.body = { total };
  }

  async save() {
      this.ctx.body = { success: await this.ctx.service.saveOrDelete.save('t_role',this.ctx.request.body)};
  }

  async delete() {
      this.ctx.body = { success: await this.ctx.service.saveOrDelete.delete('t_role',this.ctx.params.id) };
  }

  async saveRoleMenu() {
    const { roleId, menuIds } = this.ctx.request.body;
    console.log("值为:",menuIds.map(a => '(' + roleId + ',' + a + ')'));
    const sql = `insert into t_role_menu(role_id,menu_id) values ${menuIds.map(a => '(' + roleId + ',' + a + ')').reduce((a, b) => a + ',' + b)}`;
    let result;
    const conn = await this.app.mysql.beginTransaction(); // 初始化事务

    try {
      await conn.delete('t_role_menu', {
        role_id: roleId,
      }); // 第一步操作
      result = await conn.query(sql); // 第二步操作
      await conn.commit(); // 提交事务
    } catch (err) {
      await conn.rollback(); // 一定记得捕获异常后回滚事务！！
      throw err;
    }
    console.log(result);
    const updateSuccess = result.affectedRows === menuIds.length;
    this.ctx.body = { success: updateSuccess };
  }

  async roleMenu() {
    const menu = await this.app.mysql.select('t_menu', {
      where: {
        parent_id: this.ctx.params.id,
        stateflag:1
      },
    });
    this.ctx.body = menu;
  }

  async roleMenuIds() {
    const menuIds = await this.app.mysql.query('select menu_id from t_role_menu where role_id=? and stateflag=1', [ this.ctx.params.roleId ]);
    this.ctx.body = menuIds;
  }

  async userRole() {
    const roles = await this.app.mysql.query('select r.* from t_role r join t_user_role ur on r.id=ur.role_id where ur.user_id=? and r.stateflag=1',
      [ this.ctx.params.userId ]);
    this.ctx.body = roles;
  }


}

module.exports = RoleController;
