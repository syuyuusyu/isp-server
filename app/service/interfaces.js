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
            return {
                status:'801',
                message:'成功',
                respdata:[
                    {
                        username:author.user.user_name,
                        name:author.user.name,
                        userroles:author.roles.map(r=>({roleid:r.code}))
                    }
                ]
            }
        }

    }
}

module.exports = InterfaceService;