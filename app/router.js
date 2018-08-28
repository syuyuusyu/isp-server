'use strict';

module.exports = app => {
    const {router, controller} = app;
    router.get('/index', controller.home.index);

    router.get('/doNothing', controller.home.doNothing);

    // 登录
    router.post('/login', controller.home.login);
    // 退出
    router.get('/logout', controller.home.logout);

    // 接口调用
    router.get('/invokeEntityInfo', controller.restful.toPage);
    router.post('/invokeInfo/infos', controller.restful.infos);
    router.post('/invokeInfo/invokes', controller.restful.invokes);
    router.post('/invokeInfo/test', controller.restful.test);
    router.post('/invokeInfo/save', controller.restful.save);
    router.delete('/invokeInfo/delete/:id', controller.restful.delete);


    router.post('/invoke/:invokeName', controller.restful.invoke);

    router.get('/invokeInfo/checkUnique/:invokeName', controller.restful.checkUnique);
    router.get('/invokeInfo/groupName', controller.restful.groupName);

    // 角色
    // 获取角色列表
    router.get('/role/allRoles', controller.role.allRoles);
    // 检查角色名唯一
    router.post('/role/codeUnique/', controller.role.codeUnique);
    // 保存角色
    router.post('/role/save', controller.role.save);
    // 删除角色
    router.delete('/role/delete/:id', controller.role.delete);
    // 保存角色菜单权限
    router.post('/role/saveRoleMenu', controller.role.saveRoleMenu);
    // 角色菜单权限下拉菜单
    router.get('/role/roleMenu/:id', controller.role.roleMenu);
    // 角色对应的菜单ID
    router.get('/role/roleMenuIds/:roleId', controller.role.roleMenuIds);
    // 用户对应角色
    router.get('/role/userRole/:userId', controller.role.userRole);
    // 角色按钮权限页面获取菜单树和按钮
    router.get('/btn/menuButtonTree', controller.button.menuButtonTree);


    // 获取菜单
    // 根据父节点ID和当前角色获取子菜单
    router.get('/menu/currentMenu/:parentId', controller.menu.currentMenu);
    // 获取当前角色下的所有菜单
    router.get('/menu/currentRoleMenu/', controller.menu.currentRoleMenu);
    // 对应角色的完整菜单树
    router.get('/menu/menuTree', controller.menu.menuTree);

    // 用户
    // 用户列表
    router.get('/user/allUsers', controller.user.allUers);
    // 保存用户角色
    router.post('/user/saveUserRole', controller.user.saveUserRole);
    // 用户角色配置页面获取角色(根据不同用户类型获取)
    router.get('/user/userRoleConfRoles/:userId', controller.user.userRoleConfRoles);
    //查询用户
    router.post('/user/queryUser', controller.user.queryUser);


    // 按钮
    // 对应菜单下的按钮
    router.get('/btn/menuButton/:menuId', controller.button.menuButton);
    // 按钮对应的角色
    router.get('/btn/buttonRole/:roleId', controller.button.buttonRole);
    // 保存角色对应的按钮
    router.post('/btn/saveButtonRole', controller.button.saveButtonRole);
    // 保存按钮
    router.post('/btn/save', controller.button.save);
    // 获取所有按钮,并根据角色判断按钮是否可用
    router.get('/btn/allButtons/', controller.button.allButtons);
    // 删除按钮
    router.delete('/btn/delete/:id', controller.button.delete);
    // 按钮角色配置页面获取角色
    router.get('/btn/allRoles', controller.button.allRoles);

    // 系统
    // 获取应用系统列表
    router.get('/sys/allSystem', controller.system.allSystem);
    // 检查系统编码唯一性
    router.get('/sys/checkUnique/:code', controller.system.checkUnique);
    // 保存系统
    router.post('/sys/save', controller.system.save);
    // 删除系统
    router.delete('/sys/delete/:id', controller.system.delete);
    // 根据ID查询
    router.get('/sys/currentSys/:id', controller.system.currentSys);
    // 可以访问对应系统平台的角色
    router.get('/sys/sysRole/:roleId', controller.system.sysRole);
    // 保存可以访问对应系统平台的角色
    router.post('/sys/saveSysRole', controller.system.saveSysRole);
    // 当前用户对应角色可以访问的系统
    router.get('/sys/currentRoleSys', controller.system.currentRoleSys);
    // 申请平台访问权限获取平台列表
    router.get('/sys/sysAccess/:userId', controller.system.sysAccess);
    //根据系统id查询出调用接口信息的路径
    router.get('/sys/currentSysPath/:id', controller.system.currentSysPath);

    // 系统功能
    // 获取对应系统的功能列表
    router.get('/op/operations/:sysId', controller.operation.operations);
    // 保存功能
    router.post('/op/save', controller.operation.save);
    // 删除功能
    router.delete('/op/delete/:id', controller.operation.delete);

    // 机构
    // 获取机构
    router.get('/org/orgMenu/:id', controller.organiza.orgMenu);
    // 获取点击树节点时的机构
    router.get('/org/currentOrgs/:orgId', controller.organiza.currentOrgs);
    // 获取如果是最终节点时的机构信息
    router.get('/org/currentOrgIsLeaf/:orgId', controller.organiza.currentOrgIsLeaf);
    // 获取详细的机构信息
    router.get('/org/currentDetailOrg/:id', controller.organiza.currentDetailedOrg);
    // 保存修改的机构信息
    router.post('/org/save', controller.organiza.save);
    // 保存新增的机构信息
    router.post('/org/saveAdd', controller.organiza.saveAdd);
    // 删除机构信息
    router.delete('/org/delete/:id', controller.organiza.delete);
    // 获取所有用户
    router.get('/org/allUser', controller.organiza.getAllUser);
    // 获取查询出的用户
    router.get('/org/QueryUser/:value', controller.organiza.getQueryUser);
    // 点击机构用户关联按钮时获取选中机构里面的信息
    router.get('/org/SelectedRowKeys/:id', controller.organiza.getSelectedRowKeys);
    // 保存机构用户关联
    router.post('/org/saveOrgUser', controller.organiza.saveOrgUser);

    // 获取对应系统的接口调用配置
    router.get('/op/invokeOperations/:sysId', controller.operation.invokeOperations);
    // 有权访问接口的系统
    router.get('/op/invokePromiss/:operationId', controller.operation.invokePromiss);
    // 保存系统访问接口权限
    router.post('/op/saveInvokePromiss', controller.operation.saveInvokePromiss);

    // 元数据
    // 获取元数据
    router.post('/metadata/queryMetadata', controller.metadata.queryMetadata);
    // 获取元数据表信息
    router.get('/metadata/metadataFields/:metadataId', controller.metadata.metadataFields);

    // 工作流
    // 云机申请记录
    router.post('/apply/cloudApplyLog', controller.workflow.cloudApplyLog);
    // 获取云平台token
    router.get('/invoke/cloudToken', controller.swift.cloudToken);
    // 获取大数据平台token
    router.get('/invoke/dataToken', controller.swift.dataToken);
    // 发送申请平台访问权限信息
    router.post('/msg/sendApplyPlateformMsg', controller.message.sendApplyPlateformMsg);
    // 获取信息
    router.get('/msg/receive', controller.message.receive);
    // 批准申请平台访问权限
    router.post('/msg/approvalPlatform', controller.message.approvalPlatform);
    // 删除消息
    router.delete('/msg/deleteMsg/:id', controller.message.deleteMsg);
    // 否决申请
    router.post('/msg/disApproval', controller.message.disApproval);

    // 获取当前用户下的swift储存信息
    router.get('/swift/getObject/:username', controller.swift.getObject);
    // 获取token(定时任务轮询防止过期)
    router.get('/swift/swiftToken', controller.swift.swiftToken);
    // 创建文件夹
    router.post('/swift/createFolder', controller.swift.createFolder);
    // 删除swift对象
    router.post('/swift/delete', controller.swift.delete);
    // 下载文件
    router.post('/swift/download', controller.swift.download);
    // 上传文件
    router.post('/swift/upload', controller.swift.upload);
    // 获取所有容器
    router.get('/swift/containerInfo', controller.swift.containerInfo);
    // 新建容器
    router.post('/swift/createContainer', controller.swift.createContainer);


    // 对外接口调用
    router.post('/interfaces', controller.interfaces.interfaces);

    // 接口调用日志
    // 获取日志信息
    router.get('/interfacesLog/getInterfacesLog', controller.interfacesLog.allInterfacesLog);
    /* //获取日志总数
    router.get('/interfacesLog/logTotal',controller.interfacesLog.totalLogNumber);*/
    // 刷新日志
    router.get('/interfacesLog/refreshLog', controller.interfacesLog.refreshLog);
    // 获取所有系统
    router.get('/interfacesLog/allSystem', controller.interfacesLog.allSystem);
    // 获取所有响应状态
    router.get('/interfacesLog/allStatus', controller.interfacesLog.allStatus);
    // 根据条件查询出接口调用日志
    router.post('/interfacesLog/queryLog', controller.interfacesLog.queryLog);

    // 用户注册
    /* // 校验注册的用户是否唯一
     router.get('/userRegister/uniqueUser/:userName', controller.userRegister.userUnique);*/
    /*// 校验注册的用户昵称是否唯一
    router.get('/userRegister/uniqueNickName/:nickName', controller.userRegister.nickNameUnique);*/
    // 校验注册的身份证编号是否唯一
    router.get('/userRegister/uniqueIDnumber/:IDnumber', controller.userRegister.IDnumberUnique);
    // 校验注册的电话号码是否唯一
    router.get('/userRegister/uniquePhone/:phoneNumber', controller.userRegister.phoneUnique);
    // 校验注册的电话号码是否唯一
    router.get('/userRegister/uniqueEmail/:email', controller.userRegister.emailUnique);
    // 保存用户注册信息
    router.post('/userRegister/save', controller.userRegister.save);

    // 系统日志
    // 获取所有系统日志
    router.get('/systyemLog/getAllSystemLog', controller.systemLog.allSystemLog);
    // 获取所有登录用户
    router.get('/systyemLog/getAllLoginName', controller.systemLog.allLoginName);
    // 获取所有操作类型
    router.get('/systyemLog/getAllOperateType', controller.systemLog.allOperateType);
    // 根据条件查询出系统日志
    router.post('/systyemLog/querySystemLog', controller.systemLog.querySystemLog);

    // 待办日志
    // 获取所有待办日志
    router.get('/backlogLog/getAllBacklogLog', controller.backlogLog.allBacklogLog);
    // 获取所有登录用户
    router.get('/backlogLog/getAllLoginName', controller.backlogLog.allLoginName);
    // 获取所有待办状态
    router.get('/backlogLog/getBacklogStatus', controller.backlogLog.allBacklogStatus);
    // 根据条件查询出待办日志
    router.post('/backlogLog/queryBacklogLog', controller.backlogLog.queryBacklogLog);

    // 修改用户信息
    // 校验输入的身份证编号是否已存在
    router.get('/modifyUser/checkIDnumberUnique/:IDnumber', controller.modifyUser.checkIDnumberUnique);
    // 校验输入的邮箱是否已存在
    router.get('/modifyUser/checkEmailUnique/:email', controller.modifyUser.checkEmailUnique);
    // 保存用户修改信息
    router.post('/modifyUser/save', controller.modifyUser.save);

    // 重置密码
    router.get('/resetPassword/:userName', controller.resetPassword.resetPassword);

    // 菜单管理
    // 获取菜单
    router.get('/menuManage/menu/:id', controller.menuManage.initMenu);
    // 获取点击树节点时的菜单
    router.get('/menuManage/currentMenus/:menuId', controller.menuManage.currentMenus);
    // 获取如果点击的树节点是最终节点时的机构信息
    router.get('/menuManage/currentMenusIsLeaf/:menuId', controller.menuManage.currentMenuIsLeaf);
    // 保存新增的菜单信息
    router.post('/menuManage/saveAdd', controller.menuManage.saveAdd);
    // 保存修改菜单信息
    router.post('/menuManage/saveModify', controller.menuManage.saveModify);
    // 删除菜单
    router.get('/menuManage/delete/:id', controller.menuManage.delete);

    //流程业务接口----------------------

    //平台访问权限申请相关业务接口-----

    //获取用户对应的平台访问权限
    router.get('/activiti/sysAccess/:username/:isApply', controller.activitiInterfaces.userSysAccess);
    //推送用户给对应平台
    router.post('/activiti/pushUser', controller.activitiInterfaces.pushUser);


    //获取云平台的ip和token
    router.get('/s02Url/getS02Url', controller.s02Url.getS02Url);


    //大屏接口
    router.get('/map', controller.screen.map);
    router.get('/screen/picture', controller.screen.picture);
    // 地图geoJSON请求接口（第二屏）
    router.get('/screen/map_llx', controller.screen.map_llx);
    // 经济概况接口（第三屏）
    router.get('/screen/business_info', controller.screen.business_info);
    // 城市建设概况接口（第三屏）
    router.get('/screen/city_info', controller.screen.city_info);

    //获取接口配置信息
    router.get('/interfaceConfig/:flag',controller.interfaceConfig.interfaceConfig);

    //通用实体增删改查
    router.get('/entity/columns/:entityId',controller.entity.columns);
    router.get('/entity/column/:id',controller.entity.column);
    router.get('/entity/entitys',controller.entity.entitys);
    router.get('/entity/tableNames',controller.entity.tableNames);
    router.get('/entity/originalColumns',controller.entity.originalColumns);
    router.post('/entity/saveConfig/:tableName/:idField',controller.entity.saveConfig);
    router.get('/entity/deleteConfig/:tableName/:idField/:id',controller.entity.deleteConfig);
    router.get('/entity/monyToMonys',controller.entity.monyToMonys);
    router.post('/entity/query/:entityId',controller.entity.query);
    router.get('/entity/topParentId/:entityId',controller.entity.topParentId);

    //字典配置
    router.get('/dictionary/allDictionary',controller.dictionary.allDictionary);
    router.get('/dictionary/dictionary/:dicGroupId',controller.dictionary.dictionary);
    router.post('/dictionary/saveDic',controller.dictionary.saveDic);
    router.post('/dictionary/saveDicField',controller.dictionary.saveDicField);
    router.get('/dictionary/deleteGroup/:groupId',controller.dictionary.deleteGroup);
    router.get('/dictionary/deleteDictionary/:id',controller.dictionary.deleteDictionary);


};
