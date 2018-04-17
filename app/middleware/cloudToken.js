module.exports = (options,app) => {
    return async function cloudToken(ctx, next) {
        ctx.logger.info('cloudToken');
        const authorToken=ctx.request.header['access-token'];
        let {user}=await ctx.service.authorService.getByCode(authorToken);
        let cloudToken=await app.redis.get(user.user_name+'-cloudToken');
        if(!cloudToken) {
            let [entity] = app.invokeEntitys.filter(d => d.id === 47);
            let result = await ctx.service.restful.invoke(entity,{
                ip:app.config.self.cloudIp,
                username:'demo',
                password:'demo',
                domain:'domain'
            });
            cloudToken = result['cloud_token-1']['result'].token;
            console.log('cloudToken',cloudToken);
            app.redis.set(user.user_name+'-cloudToken',cloudToken);
        }
        ctx.request.body={
            ...ctx.request.body,
            ip:app.config.self.cloudIp,
            token:cloudToken
        };
        await next();

        if(ctx.body && ctx.body.code && ctx.body.code===500){
            app.redis.del(user.user_name+'-cloudToken');
        }

    };
};