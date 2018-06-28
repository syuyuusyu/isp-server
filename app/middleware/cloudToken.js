module.exports = (options,app) => {
    return async function cloudToken(ctx, next) {
        //ctx.logger.info('cloudToken');
        const authorToken=ctx.request.header['access-token'];
        let {user}=await ctx.service.authorService.getByCode(authorToken);
        let cloudToken=await app.redis.get(user.user_name+'-cloudToken');
        if(!cloudToken) {
            const ispToken=ctx.service.interfaces.randomString(8);
            app.redis.set(ispToken,JSON.stringify(user));
            const invokeEntitys=await ctx.service.redis.get('invokeEntitys');
            let [entity] =invokeEntitys.filter(d => d.id === 59);
            let result = await ctx.service.restful.invoke(entity,{
                //ip:app.systemUrl['s02'],
                ip:await ctx.service.redis.getProperty('systemUrl','s02'),
                ispToken:ispToken,
            });
            cloudToken = result['cloud_isptoken-1']['result'].token;
            console.log('cloudToken',cloudToken);
            app.redis.set(user.user_name+'-cloudToken',cloudToken);
        }
        ctx.request.body={
            ...ctx.request.body,
            //ip:app.systemUrl['s02'],
            ip:await ctx.service.redis.getProperty('systemUrl','s02'),
            token:cloudToken,
            //domain:app.systemUrl['s01'],
            domain:await ctx.service.redis.getProperty('systemUrl','s01')
        };
        if(cloudToken) {
            await next();
            if (ctx.body && ctx.body.code && ctx.body.code === 500) {
                ctx.logger.info('del cloudToken');
                app.redis.del(user.user_name + '-cloudToken');
            }
            if(ctx.body && ctx.body.ok===false ){
                ctx.logger.info('del cloudToken');
                app.redis.del(user.user_name + '-cloudToken');
            }
            if(ctx.body && ctx.body.status && ctx.body.status===40101 ){
                ctx.logger.info('del cloudToken');
                app.redis.del(user.user_name + '-cloudToken');
            }
        }else{
            ctx.body={code:500,msg:'获取token失败'}
        }

    };
};


