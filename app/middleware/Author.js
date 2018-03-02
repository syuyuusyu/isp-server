const jwt=require('jsonwebtoken');

module.exports = options => {
    return async function author(ctx, next) {
        await next();
        ctx.logger.info(ctx.request.url);
        console.log('--------');
        // jwt.verify(token, this.app.secret, function(err, decoded){
        //     if (err) {
        //         console.log('Error:', err);
        //     } else {
        //         console.log(decoded);
        //     };
        // });

    };
};
