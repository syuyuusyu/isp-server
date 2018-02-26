'use strict';

module.exports = app => {
    const { router, controller } = app;
    router.get('/', controller.home.index);

    //接口调用
    router.get('/invokeEntityInfo',controller.restful.toPage);
    router.post('/invokeInfo/infos',controller.restful.infos);
    router.post('/invokeInfo/invokes',controller.restful.invokes);
    router.post('/invokeInfo/test',controller.restful.test);
    router.post('/invokeInfo/save',controller.restful.save);
    router.delete('/invokeInfo/delete/:id',controller.restful.delete);

    //获取菜单
    router.get('/menu/currentMenu/:parentId',controller.menu.currentMenu);
    router.get('/menu/test',controller.menu.test);
};
