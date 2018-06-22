module.exports = (options,app) => {
    return async function swiftToken(ctx, next) {
        ctx.logger.info('swiftToken');
        let swiftToken=await app.redis.get('swiftToken');
        if(!swiftToken) {
            const invokeEntitys=await ctx.service.redis.get('invokeEntitys');
            let [entity] = invokeEntitys.filter(d => d.id === 24);
            let result = await ctx.service.restful.invoke(entity,{
                keystoneIp:app.config.self.keystoneIp
            });
            swiftToken = result['openstack-verify-1']['result'][0].token;
            app.redis.set('swiftToken',swiftToken);
        }
        ctx.logger.info('swiftToken',swiftToken);
        ctx.request.headers['X-Auth-Token']=swiftToken;
        await next();

        if(ctx.body && ctx.body.status && ctx.body.status===401){
            ctx.logger.info('del swiftToken');
            app.redis.del('swiftToken');

        }

    };
};