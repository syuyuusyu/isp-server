const Controller =require('egg').Controller;
const fs = require('fs');

class SwiftController extends Controller{

    constructor(){
        super(...arguments);
        this.swiftBaseUrl='http://10.10.0.1:8080/v1/AUTH_491ec2831b2146b18fb8bf0c0ab4a1e5/';
    }



    async getObject(){
        let token=this.ctx.request.header['X-Auth-Token'];
        let [invokeEntity]=this.app.invokeEntitys.filter(d=>d.id===28);
        let result=await this.service.restful.invoke(invokeEntity,
            {
                token:token,
                username:this.ctx.params.username,
                swiftBaseUrl:this.swiftBaseUrl
            }
            );
        console.log(result[`${invokeEntity.name}-1`].result);
        this.ctx.body=result[`${invokeEntity.name}-1`].result;
    }

    async createFolder(){
        const {filePath,username} =this.ctx.request.body;
        let token=this.ctx.request.header['X-Auth-Token'];
        let [invokeEntity]=this.app.invokeEntitys.filter(d=>d.id===29);
        let result=await this.service.restful.invoke(invokeEntity,
            {
                token:token,
                username:username,
                swiftBaseUrl:this.swiftBaseUrl,
                filePath:encodeURI(filePath)
            }
        );
        console.log(result);
        this.ctx.body=result[`${invokeEntity.name}-1`].result;
    }

    async delete(){
        const {filePath,username} =this.ctx.request.body;
        let token=this.ctx.request.header['X-Auth-Token'];
        let [invokeEntity]=this.app.invokeEntitys.filter(d=>d.id===30);
        let result=await this.service.restful.invoke(invokeEntity,
            {
                token:token,
                username:username,
                swiftBaseUrl:this.swiftBaseUrl,
                filePath:encodeURI(filePath)
            }
        );
        console.log(result);
        this.ctx.body=result[`${invokeEntity.name}-1`].result;
    }

    async download(){
        let token=this.ctx.request.header['X-Auth-Token'];
        console.log(`${this.swiftBaseUrl}admin/test1/sunrise.sql`);
        const result =await this.ctx.curl(`${this.swiftBaseUrl}admin/test1/sunrise.sql`, {
            //writeStream: fs.createWriteStream('/Users/syu/scp/sdsd.sql'),
            streaming: true,
            headers:{'X-Auth-Token':token}
        });
        //console.log(result.res);
        this.ctx.set(result.header);
        // result.res 是一个 stream
        this.ctx.body = result.res;

    }

}



module.exports=SwiftController;