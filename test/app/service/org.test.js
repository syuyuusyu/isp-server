'use strict';

const { app, assert } = require('egg-mock/bootstrap');

describe('test/app/service/org.test.js', () => {

    it('createOrg', async ()=> {

        const ctx = app.mockContext();
        console.log(app.config.discription);
        //await ctx.service.organization.createGovOrg();
        //await ctx.service.organization.delete();
        app.mysql.query(`SELECT s.*, so.path FROM t_system s join t_sys_operation so on so.system_id=s.id where so.type=? and  
        s.CODE IN(?) AND s.stateflag = 1`
            ,[5,[ 's05', 's08', 's13', 's15' ]])

    });

});