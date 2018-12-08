const Controller = require('egg').Controller;

class S02Url extends Controller {

    async getS02Url(ctx, next) {
        const authorToken = ctx.request.header['access-token'];
        let {user} = await ctx.service.authorService.getByCode(authorToken);
        const ip = await ctx.service.redis.getProperty('systemUrl', 's02');
        const ispToken = ctx.service.interfaces.randomString(8);
        await this.app.redis.set(ispToken, JSON.stringify(user));
        const invokeEntitys = await ctx.service.redis.get('invokeEntitys');
        let [entity] = invokeEntitys.filter(d => d.id === 59);
        let result = await ctx.service.restful.invoke(entity, {
            //ip:app.systemUrl['s02'],
            ip: ip,
            ispToken: ispToken,
        });
        const cloudToken = result['cloud_isptoken-1']['result'].token;
        this.ctx.body = {cloudToken: cloudToken, ip: ip}
    }
}

module.exports = S02Url;
