module.exports = options => {
    return async function allowAccess(ctx, next) {
        await next();
        ctx.set('Access-Control-Allow-Origin','*');
        ctx.set('Access-Control-Allow-Methods','GET,PUT,POST,DELETE');
        ctx.set('Access-Control-Expose-Headers','Content-Type');
    };
};
