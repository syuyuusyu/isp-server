const Service=require('egg').Service;

class InterfaceService extends Service{

    async verifications(body){
        const {system,reqdata:[{token}]}=body;
        const author=await this.service.authorService.getByCode(token+system);
        console.log(author);
        if(!author){
            return {
                status:'806',
                messages: '令牌token无效'
            }
        }else{
            this.app.redis.del(token+system);
            this.app.loginSystem.push(system);
            author.user.user_name=author.user.user_name.replace(/^s\d{2}(\w+)/,(w,p)=>{
                return p;
            });
            return {
                status:'801',
                message:'成功',
                respdata:[
                    {
                        username:author.user.user_name,
                    }
                ]
            }
        }

    }
}

module.exports = InterfaceService;