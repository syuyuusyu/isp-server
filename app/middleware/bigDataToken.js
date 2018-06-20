module.exports = (options,app) => {
    return async function bigDataToken(ctx, next) {
        ctx.logger.info('bigDataToken');
        const authorToken=ctx.request.header['access-token'];
        let {user}=await ctx.service.authorService.getByCode(authorToken);
        let bigDataToken=await app.redis.get(user.user_name+'-bigDataToken');
        if(!bigDataToken) {
            const invokeEntitys=await this.ctx.service.redis.get('invokeEntitys');
            let [entity] = invokeEntitys.filter(d => d.id === 48);
            const ispToken=ctx.service.interfaces.randomString(8);
            let result = await ctx.service.restful.invoke(entity,{
                //ip:app.systemUrl['s03'],
                ip:await ctx.service.redis.getProperty('systemUrl','s03'),
                ispToken:ispToken
            });
            bigDataToken = result['data_token-1']['result'].token;
            app.redis.set(user.user_name+'-bigDataToken',bigDataToken);
        }
        ctx.request.body={
            ...ctx.request.body,
            //ip:app.systemUrl['s03'],
            ip:await ctx.service.redis.getProperty('systemUrl','s03'),
            token:bigDataToken
        };
        await next();
        if(ctx.body && ctx.body.status && ctx.body.status===40101){
            ctx.logger.info('刷新bigDataToken');
            app.redis.del(user.user_name+'-bigDataToken');
        }

    };
};