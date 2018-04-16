const Controller = require('egg').Controller;
const fs = require('fs');
const sendToWormhole = require('stream-wormhole');

class SwiftController extends Controller {


    async swiftToken(){
        this.ctx.body={status:401};
    }

    async cloudToken(){
        this.ctx.body={code: 500, msg: '无效Token!'};
    }

    async createContainer(){
        let token = this.ctx.request.header['X-Auth-Token'];
        const {username}=this.ctx.request.body;
        let result={};
        const result1 = await this.ctx.curl(`${this.app.config.self.swiftBaseUrl}${username}/`,{
            headers: {
                'X-Auth-Token': token,
                "Content-Length": 0
            },
            method:'PUT'
        });
        if(result1.status===201){
            const result2 = await this.ctx.curl(`${this.app.config.self.swiftBaseUrl}${username}/root/`,{
                headers: {
                    'X-Auth-Token': token,
                    "Content-Length": 0
                },
                method:'PUT'
            });
            result.status=result2.status
        }else{
            result.status=result1.status
        }
        this.ctx.body={status:result.status};
    }

    async containerInfo(){
        let token = this.ctx.request.header['X-Auth-Token'];
        let result;
        try{
            result= await this.ctx.curl(`${this.app.config.self.swiftBaseUrl}?format=json`,{
                headers: {'X-Auth-Token': token},
                dataType: 'json',
            });
            result=result.data;
        }catch (e){
            result={status:401}
        }

        this.ctx.body=result;
    }

    async getObject() {
        let token = this.ctx.request.header['X-Auth-Token'];
        let [invokeEntity] = this.app.invokeEntitys.filter(d => d.id === 28);
        let result = await this.service.restful.invoke(invokeEntity,
            {
                token: token,
                username: this.ctx.params.username,
                swiftBaseUrl: this.app.config.self.swiftBaseUrl
            }
        );
        this.ctx.body = result[`${invokeEntity.name}-1`].result;
    }

    async createFolder() {
        const {filePath, username} = this.ctx.request.body;
        let token = this.ctx.request.header['X-Auth-Token'];
        let [invokeEntity] = this.app.invokeEntitys.filter(d => d.id === 29);
        let result = await this.service.restful.invoke(invokeEntity,
            {
                token: token,
                username: username,
                swiftBaseUrl: this.app.config.self.swiftBaseUrl,
                filePath: encodeURI(filePath)
            }
        );
        this.ctx.body = result[`${invokeEntity.name}-1`].result;
    }

    async delete() {
        const {filePath, username} = this.ctx.request.body;
        let token = this.ctx.request.header['X-Auth-Token'];
        let [invokeEntity] = this.app.invokeEntitys.filter(d => d.id === 30);
        let result = await this.service.restful.invoke(invokeEntity,
            {
                token: token,
                username: username,
                swiftBaseUrl: this.app.config.self.swiftBaseUrl,
                filePath: encodeURI(filePath)
            }
        );
        this.ctx.body = result[`${invokeEntity.name}-1`].result;
    }

    async download() {
        let token = this.ctx.request.header['X-Auth-Token'];
        const {name,username} = this.ctx.request.body;
        const result = await this.ctx.curl(`${this.app.config.self.swiftBaseUrl}${username}/${name}`, {
            //writeStream: fs.createWriteStream('/Users/syu/scp/sdsd.sql'),
            streaming: true,
            headers: {'X-Auth-Token': token}
        });
        this.ctx.set(result.header);
        this.ctx.set('Content-Type', 'application/octet-stream');
        this.ctx.set('Accept', 'application/octet-stream');
        this.ctx.set('Content-Disposition', 'attachment;');
        // result.res 是一个 stream
        this.ctx.body = result.res;

    }

    async upload() {

        const ctx = this.ctx;
        console.log(ctx.request.header);
        const token = ctx.request.header['X-Auth-Token'];
        const username = ctx.request.header['user-name'];
        const flodername = ctx.request.header['folder-path'];

        const parts = ctx.multipart();
        let part;
        // parts() return a promise
        while ((part = await parts()) != null) {
            if (part.length) {
                return;
            } else {
                if (!part.filename) {
                    return;
                }
                // 文件处理，上传到云存储等等
                let result;
                try {
                    console.log(`${this.app.config.self.swiftBaseUrl}${username}/${flodername}${encodeURI(part.filename)}`);
                    result = await this.ctx.curl(
                        `${this.app.config.self.swiftBaseUrl}${username}/${flodername}${encodeURI(part.filename)}`,
                        {
                        //writeStream: fs.createWriteStream('/Users/syu/scp/sdsd.sql'),
                            stream: part,
                            headers: {'X-Auth-Token': token},
                            method:'PUT',
                            timeout:200000
                        });
                } catch (err) {
                    // 必须将上传的文件流消费掉，要不然浏览器响应会卡死
                    await sendToWormhole(part);
                    throw err;
                }
            }
        }
        ctx.body={a:1};
    }

}


module.exports = SwiftController;