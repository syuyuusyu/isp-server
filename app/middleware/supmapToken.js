module.exports = (options,app) => {
    return async function cloudToken(ctx, next) {
        ctx.logger.info('supermapToken');

        ctx.request.body={
            ...ctx.request.body,
            //ip:app.systemUrl['s02'],
            ip:await ctx.service.redis.getProperty('systemUrl','s12'),
            keyid:await ctx.service.redis.get(`keyverify_token_s01`),
        };
        await next();
    };
};


