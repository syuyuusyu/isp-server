module.exports = (options,app) => {
    return async function bigDataToken(ctx, next) {
        ctx.logger.info('bigDataToken');
        const authorToken=ctx.request.header['access-token'];
        let {user}=await ctx.service.authorService.getByCode(authorToken);
        let bigDataToken=await app.redis.get(user.user_name+'-bigDataToken');
        if(!bigDataToken) {
            let [entity] = app.invokeEntitys.filter(d => d.id === 48);
            let result = await ctx.service.restful.invoke(entity,{
                ip:app.config.self.bigDataIp,
                username:'admin',
                password:'123456',
            });
            bigDataToken = result['data_token-1']['result'].token;
            app.redis.set(user.user_name+'-bigDataToken',bigDataToken);
        }
        ctx.request.body={
            ...ctx.request.body,
            ip:app.config.self.bigDataIp,
            token:bigDataToken
        };
        await next();
        if(ctx.body && ctx.body.status && ctx.body.status===40101){
            ctx.logger.info('刷新bigDataToken');
            app.redis.del(user.user_name+'-bigDataToken');
        }

    };
};