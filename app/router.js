'use strict';

module.exports = app => {
    const { router, controller } = app;
    const swiftToken = app.middleware.swiftToken();
    router.get('/index', controller.home.index);

    //登录
    router.post('/login',controller.home.login);
    //退出
    router.get('/logout',controller.home.logout);

    //接口调用
    router.get('/invokeEntityInfo',controller.restful.toPage);
    router.post('/invokeInfo/infos',controller.restful.infos);
    router.post('/invokeInfo/invokes',controller.restful.invokes);
    router.post('/invokeInfo/test',controller.restful.test);
    router.post('/invokeInfo/save',controller.restful.save);
    router.delete('/invokeInfo/delete/:id',controller.restful.delete);
    router.post('/invoke/:invokeName',controller.restful.invoke);
    router.get('/invokeInfo/checkUnique/:invokeName',controller.restful.checkUnique);
    router.get('/invokeInfo/groupName',controller.restful.groupName);

    //角色
    //获取角色列表
    router.get('/role/allRoles',controller.role.allRoles);
    //检查角色名唯一
    router.post('/role/codeUnique/',controller.role.codeUnique);
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
    //用户对应角色
    router.get('/role/userRole/:userId',controller.role.userRole);
    //角色按钮权限页面获取菜单树和按钮
    router.get('/btn/menuButtonTree',controller.button.menuButtonTree);



    //获取菜单
    //根据父节点ID和当前角色获取子菜单
    router.get('/menu/currentMenu/:parentId',controller.menu.currentMenu);
    //获取当前角色下的所有菜单
    router.get('/menu/currentRoleMenu/',controller.menu.currentRoleMenu);
    //对应角色的完整菜单树
    router.get('/menu/menuTree',controller.menu.menuTree);

    //用户
    //用户列表
    router.get('/user/allUsers',controller.user.allUers);
    //保存用户角色
    router.post('/user/saveUserRole',controller.user.saveUserRole);
    //用户角色配置页面获取角色(根据不同用户类型获取)
    router.get('/user/userRoleConfRoles/:userId',controller.user.userRoleConfRoles);


    //按钮
    //对应菜单下的按钮
    router.get('/btn/menuButton/:menuId',controller.button.menuButton);
    //按钮对应的角色
    router.get('/btn/buttonRole/:roleId',controller.button.buttonRole);
    //保存角色对应的按钮
    router.post('/btn/saveButtonRole',controller.button.saveButtonRole);
    //保存按钮
    router.post('/btn/save',controller.button.save);
    //获取所有按钮,并根据角色判断按钮是否可用
    router.get('/btn/allButtons/',controller.button.allButtons);
    //删除按钮
    router.delete('/btn/delete/:id',controller.button.delete);
    //按钮角色配置页面获取角色
    router.get('/btn/allRoles',controller.button.allRoles);

    //系统
    //获取应用系统列表
    router.get('/sys/allSystem',controller.system.allSystem);
    //检查系统编码唯一性
    router.get('/sys/checkUnique/:code',controller.system.checkUnique);
    //保存系统
    router.post('/sys/save',controller.system.save);
    //删除系统
    router.delete('/sys/delete/:id',controller.system.delete);
    //根据ID查询
    router.get('/sys/currentSys/:id',controller.system.currentSys);
    //可以访问对应系统平台的角色
    router.get('/sys/sysRole/:roleId',controller.system.sysRole);
    //保存可以访问对应系统平台的角色
    router.post('/sys/saveSysRole',controller.system.saveSysRole);
    //当前用户对应角色可以访问的系统
    router.get('/sys/currentRoleSys',controller.system.currentRoleSys);
    //申请平台访问权限获取平台列表
    router.get('/sys/sysAccess/:userId',controller.system.sysAccess);

    //系统功能
    //获取对应系统的功能列表
    router.get('/op/operations/:sysId',controller.operation.operations);
    //保存功能
    router.post('/op/save',controller.operation.save);
    //删除功能
    router.delete('/op/delete/:id',controller.operation.delete);

    //机构
    //获取机构
    router.get('/org/orgMenu/:id',controller.organiza.orgMenu);
    //获取点击树节点时的机构
    router.get('/org/currentOrgs/:orgId',controller.organiza.currentOrgs);
    //获取如果是最终节点时的机构信息
    router.get('/org/currentOrgIsLeaf/:orgId',controller.organiza.currentOrgIsLeaf);
    //获取详细的机构信息
    router.get('/org/currentDetailOrg/:id',controller.organiza.currentDetailedOrg);
    //保存修改的机构信息
    router.post('/org/save',controller.organiza.save);
    //保存新增的机构信息
    router.post('/org/saveAdd',controller.organiza.saveAdd);
    //删除机构信息
    router.delete('/org/delete/:id',controller.organiza.delete);

    //获取对应系统的接口调用配置
    router.get('/op/invokeOperations/:sysId',controller.operation.invokeOperations);
    //有权访问接口的系统
    router.get('/op/invokePromiss/:operationId',controller.operation.invokePromiss);
    //保存系统访问接口权限
    router.post('/op/saveInvokePromiss',controller.operation.saveInvokePromiss);

    //字典
    //获取字典
    router.get('/dic/getDictionary/:groupId',controller.dictionary.getDictionary);

    //元数据
    //获取元数据
    router.post('/metadata/queryMetadata',controller.metadata.queryMetadata);
    //获取元数据表信息
    router.get('/metadata/metadataFields/:metadataId',controller.metadata.metadataFields);

    //工作流
    //云机申请记录
    router.post('/apply/cloudApplyLog',controller.workflow.cloudApplyLog);
    //发送申请平台访问权限信息
    router.post('/msg/sendApplyPlateformMsg',controller.message.sendApplyPlateformMsg);
    //获取信息
    router.get('/msg/receive',controller.message.receive);
    //批准申请平台访问权限
    router.post('/msg/approvalPlatform',controller.message.approvalPlatform);
    //删除消息
    router.delete('/msg/deleteMsg/:id',controller.message.deleteMsg);
    //否决申请
    router.post('/msg/disApproval',controller.message.disApproval);

    //获取当前用户下得swift储存信息
    router.get('/swift/getObject/:username',controller.swift.getObject);
    //创建文件夹
    router.post('/swift/createFolder',controller.swift.createFolder);
    //删除swift对象
    router.post('/swift/delete',controller.swift.delete);
    //下载文件
    router.post('/swift/download',controller.swift.download);
    //上传文件
    router.post('/swift/upload',controller.swift.upload);
    //获取所有容器
    router.get('/swift/containerInfo',controller.swift.containerInfo);
    //新建容器
    router.post('/swift/createContainer',controller.swift.createContainer);



    //对外接口调用
    router.post('/interfaces',controller.interfaces.interfaces);

    //接口调用日志
    //获取日志信息
    router.get('/interfacesLog/getInterfacesLog',controller.interfacesLog.allInterfacesLog);
    /*//获取日志总数
    router.get('/interfacesLog/logTotal',controller.interfacesLog.totalLogNumber);*/
    //刷新日志
    router.get('/interfacesLog/refreshLog',controller.interfacesLog.refreshLog);
    //获取所有系统
    router.get('/interfacesLog/allSystem',controller.interfacesLog.allSystem);
    //获取所有接口
    router.get('/interfacesLog/allInterfaces',controller.interfacesLog.allInterfaces);
    //根据条件查询出接口调用日志
    router.post('/interfacesLog/queryLog',controller.interfacesLog.queryLog);
};
