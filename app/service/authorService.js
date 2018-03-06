const Service=require('egg').Service;

class AuthorService extends Service{

    async getAuthor(token){
        //console.log(this.app.redis.get(token));
        let json= await this.app.redis.get(token);
        return JSON.parse(json);
    }

}


module.exports = AuthorService;