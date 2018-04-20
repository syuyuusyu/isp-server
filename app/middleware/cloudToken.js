module.exports = (options,app) => {
    return async function cloudToken(ctx, next) {
        ctx.logger.info('cloudToken');
        const authorToken=ctx.request.header['access-token'];
        let {user}=await ctx.service.authorService.getByCode(authorToken);
        let cloudToken=await app.redis.get(user.user_name+'-cloudToken');
        if(!cloudToken) {
            const ispToken=ctx.service.interfaces.randomString(8);
            app.redis.set(ispToken,JSON.stringify(user));
            let [entity] = app.invokeEntitys.filter(d => d.id === 59);
            let result = await ctx.service.restful.invoke(entity,{
                ip:app.systemUrl['s02'],
                ispToken:ispToken,
            });
            cloudToken = result['cloud_isptoken-1']['result'].token;
            console.log('cloudToken',cloudToken);
            app.redis.set(user.user_name+'-cloudToken',cloudToken);
        }
        ctx.request.body={
            ...ctx.request.body,
            ip:app.systemUrl['s02'],
            token:cloudToken
        };
        await next();

        if(ctx.body && ctx.body.code && ctx.body.code===500){
            app.redis.del(user.user_name+'-cloudToken');
        }

    };
};