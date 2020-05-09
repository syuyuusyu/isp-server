module.exports = (options, app) => {
    return async function aptToken(ctx, next) {
        ctx.logger.info('aptToken');
        let cookie = await app.redis.get('aptCookie');
        let token = await app.redis.get('aptToken');
        if (!cookie || !token) {
            const invokeEntitys = await ctx.service.redis.get('invokeEntitys');
            let [entity] = invokeEntitys.filter(d => d.name === 'aptlogin');
            let result = await ctx.service.restful.invoke(entity, {});
            console.log(result)
            cookie = result['aptlogin-1']['result'].Cookie;
            token = result['aptlogin-1']['result'].token;
            app.redis.set(`aptCookie`, cookie, 'Ex', 60 * 20);
            app.redis.set(`aptToken`, token, 'Ex', 60 * 20);

        }
        ctx.logger.info('aptCookie', cookie);
        ctx.request.body = {
            ip: 'https://20.18.6.16',
            ...ctx.request.body,
            token: token,
            cookie: cookie
        };
        await next();

    };
};