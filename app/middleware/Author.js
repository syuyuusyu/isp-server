const jwt=require('jsonwebtoken');

module.exports = (options,app) => {
    return async function author(ctx, next) {
        ctx.logger.info('author');
        let s=await asyncVerify(ctx.request.header['access-token'], 'n7d3t7x7',next);
    };
};

function asyncVerify(token,secret,next){
    return new Promise((resolve, reject)=>{
        jwt.verify(token, secret,  (err, decoded)=>{
            if (err) {
                console.log('Error:', err);
                reject(err);
            } else {
                resolve(next());
            };
        });
    });
}
