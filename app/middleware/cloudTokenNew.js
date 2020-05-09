module.exports = (options, app) => {
    return async function cloudTokenNew(ctx, next) {
        //ctx.logger.info('cloudToken');

        let cloudToken = await app.redis.get('newcloudToken');
        if (!cloudToken) {
            let result = await app.curl('http://10.10.50.108:8889/rest/identity/login/in?_token=&_from=ajax', {
                data: { username: 'admin', password: '111111' },
                method: 'POST',
                contentType: 'multipart/form-data',
                dataType: 'json',
            });
            console.log(result.data);
            if (result.data.ok) {
                app.redis.set('newcloudToken', result.data.entity.token, 'Ex', 60 * 20);
                cloudToken = result.data.entity.token;
            }
        }
        ctx.request.body = {
            ip: 'http://10.10.50.108:8889',
            token: cloudToken,
            ...ctx.request.body,
        };
        if (cloudToken) {
            await next();
            if (ctx.body && ctx.body.code && ctx.body.code === 500) {
                ctx.logger.info('del cloudToken');
                app.redis.del('newcloudToken');
            }
            if (ctx.body && ctx.body.ok === false) {
                ctx.logger.info('del cloudToken');
                app.redis.del('newcloudToken');
            }
            if (ctx.body && ctx.body.status && ctx.body.status === 40101) {
                ctx.logger.info('del cloudToken');
                app.redis.del('newcloudToken');
            }
        } else {
            ctx.body = { code: 500, msg: '获取token失败' }
        }

    };
};


