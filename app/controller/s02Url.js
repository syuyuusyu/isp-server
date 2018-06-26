const Controller =require('egg').Controller;

class S02Url extends Controller{
  async getS02Url(ctx, next){
    const authorToken=ctx.request.header['access-token'];
    let {user}=await ctx.service.authorService.getByCode(authorToken);
    let cloudToken=await this.app.redis.get(user.user_name+'-cloudToken');
    let content=await this.app.mysql.query('select * from t_system where code=?',['s02']);
    const ip=content[0].url;
    this.ctx.body={cloudToken:cloudToken,ip:ip}
  }
}
module.exports=S02Url;
