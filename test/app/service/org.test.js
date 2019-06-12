'use strict';

const { app, assert } = require('egg-mock/bootstrap');

describe('test/app/service/org.test.js', () => {

    it('createOrg', async ()=> {

        const ctx = app.mockContext();
        await ctx.service.organization.createGovOrg();
        //await ctx.service.organization.delete();
        //console.log("done")

    });

});