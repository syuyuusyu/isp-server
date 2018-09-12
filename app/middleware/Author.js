const jwt=require('jsonwebtoken');

module.exports = (options,app) => {
    return async function author(ctx, next) {
        ctx.logger.info('author');
       // await asyncVerify(ctx,ctx.request.header['access-token'], 'n7d3t7x7',next);
        const token=ctx.request.header['access-token'];
        const author=await ctx.service.authorService.getByCode(token);
        ctx.service.systemLog.operateLog(ctx);
        if((token && author) ){
            ctx.isGov=ctx.request.header['isGov'];
            await next();
        }else{
            ctx.logger.info('token失效!!!');
            ctx.status=401;
            ctx.body={status:401,message:'token失效'};
        }
    };
};

function asyncVerify(ctx,token,secret,next){
    return new Promise((resolve, reject)=>{
        jwt.verify(token, secret,  (err, decoded)=>{
            if (err) {
                ctx.logger.error('token失效',err);
                ctx.body={status:401,message:'token失效'};
                reject(err);
            } else {
                ctx.logger.info('验证token成功');
                resolve(next());
            };
        });
    });
}
