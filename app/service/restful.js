const Service=require('egg').Service;
const EventEmitter = require('events').EventEmitter;

class RestfulService extends Service{

    constructor(ctx){
        super(ctx);
        Object.assign(this,EventEmitter.prototype);
    }

    async invoke(entity,queryObj){
        let count=1,
            result={};
        try{
            await this._invoke(entity,queryObj,count,result);
            result.success=true;
            result.msg='成功';
            //this.app.logger.info(result);
        }catch (e){
            console.log('----');
            this.app.logger.error(e);
            result.success=false;
            result.errInfo=e.toString();
        }
        return result;
    }

    async _invoke(entity,queryObj,count, result){
        const invokeName=entity.name+'-'+count;
        result[invokeName]={};
        let url=this.parseByqueryMap(entity.url,queryObj);
        let method=entity.method.toUpperCase();
        let data=this.parseByqueryMap(entity.body,queryObj);
        data=JSON.parse(data);
        let head=this.parseByqueryMap(entity.head,queryObj);
        head=JSON.parse(head);
        this.app.logger.info('url:',url);
        this.app.logger.info('head:',head);
        this.app.logger.info('body:',data);


        let invokeResult;
        try{
            invokeResult=await this.app.curl(url,{
                method:method,
                data:data,
                headers:head,
                dataType: 'json',
                timeout:20000
            });
        }catch (e2){
            this.app.logger.error(e2);
            try{
                invokeResult=await this.app.curl(url,{
                    method:method,
                    data:data,
                    headers:head,
                    //dataType: 'json',
                    timeout:20000
                });
            }catch (e){
                this.app.logger.error(e);
                invokeResult={
                    success:false,
                    result:'调用接口'+url+'错误,'+e.toString()
                }

            }

        }
        this.app.logger.info('status',invokeResult.status);
        this.app.logger.info('result',invokeResult.data);
        if(entity.parseFun){
            try {
                let fn=evil(entity.parseFun);
                let s=fn(invokeResult.data,invokeResult.headers,invokeResult.status,head,data,url);
                //response,responsehead,responsestatus,requesthead,requestdata,url
                result[invokeName].result=s;
            }catch (e){
                this.app.logger.error(e);
                result[invokeName].result=invokeResult.data;
            }
        }else{
            result[invokeName].result=invokeResult.data;
        }

        result[invokeName].body=data;
        result[invokeName].head=head;
        result[invokeName].url=url;
        if(entity.next && result[invokeName].result.map){
            let nextEntitys=//await this.app.mysql.select('invoke_info',{where: {  id: entity.next.split(',') }});
                    this.app.invokeEntitys.filter(d=>{
                        let flag=false;
                        entity.next.split(',').forEach(i=>{
                            if(i===d.id+''){
                                flag=true;
                            }
                        });
                        return flag;
                    });
            for(let netxEn of nextEntitys){
                let currentCount=count;
                let promises=result[entity.name+'-'+count].result.map(r=> {
                    currentCount++;
                    let currentQurtyObj = {};
                    Object.assign(currentQurtyObj, queryObj);
                    let queryParams = this.queryParams(netxEn);
                    queryParams.forEach(p => {
                        if (r[p]) {
                            currentQurtyObj[p] = r[p];
                        }
                    });
                    return this._invoke(netxEn, currentQurtyObj, currentCount, result);

                });
                await Promise.all(promises);
            }
        }
    }

    parseByqueryMap(str,queryMap){
        return str.replace(/(@(\w+))/g,(w,p1,p2)=>{
            return queryMap[p2]?queryMap[p2]:p1;
        });
    };

    queryParams(entity){
        let queryStr=''+entity.url+entity.head+entity.body;
        let params=[];
        queryStr.replace(/@(\w+)/g,(w,p1)=>{
            params.push(p1);
        });
        return params;
    }



}

function evil(fn) {
    fn.replace(/(\s?function\s?)(\w?)(\s?\(w+\)[\s|\S]*)/g,function(w,p1,p2,p3){
        return p1+p3;
    });
    let Fun = Function;
    return new Fun('return ' + fn)();
}

module.exports = RestfulService;