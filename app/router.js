'use strict';

module.exports = app => {
    const { router, controller } = app;
    router.get('/', controller.home.index);

    //登录
    router.post('/login',controller.home.login);

    //接口调用
    router.get('/invokeEntityInfo',controller.restful.toPage);
    router.post('/invokeInfo/infos',controller.restful.infos);
    router.post('/invokeInfo/invokes',controller.restful.invokes);
    router.post('/invokeInfo/test',controller.restful.test);
    router.post('/invokeInfo/save',controller.restful.save);
    router.delete('/invokeInfo/delete/:id',controller.restful.delete);

    //角色
    //获取角色列表
    router.get('/role/allRoles',controller.role.allRoles);
    //检查角色名唯一
    router.get('/role/codeUnique/:code',controller.role.codeUnique);
    //保存角色
    router.post('/role/save',controller.role.save);
    //删除角色
    router.delete('/role/delete/:id',controller.role.delete);
    //保存角色菜单权限
    router.post('/role/saveRoleMenu',controller.role.saveRoleMenu);
    //角色菜单权限下拉菜单
    router.get('/role/roleMenu/:id',controller.role.roleMenu);
    //角色对应的菜单ID
    router.get('/role/roleMenuIds/:roleId',controller.role.roleMenuIds);

    //获取菜单
    router.get('/menu/currentMenu/:parentId',controller.menu.currentMenu);
    //router.get('/menu/test',controller.menu.test);

    //用户
    //用户列表
    router.get('/user/allUsers',controller.user.allUers);
};
