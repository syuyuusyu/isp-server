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
        }catch (e){
            console.log('----');
            console.log(e);
            result.success=false;
            result.errInfo=e.toString();
        }
        return result;
    }

    async _invoke(entity,queryObj,count, result){
        let invokeName=entity.name+'-'+count;
        result[invokeName]={};
        let url=this.parseByqueryMap(entity.url,queryObj);
        let method=entity.method.toUpperCase();
        let data=this.parseByqueryMap(entity.body,queryObj);
        data=JSON.parse(data);
        let head=this.parseByqueryMap(entity.head,queryObj);
        head=JSON.parse(head);

        let invokeResult=await this.app.curl(url,{
            method:method,
            data:data,
            headers:head,
            dataType: 'json'
        });
        if(entity.parseFun){
            try {
                let fn=evil(entity.parseFun);
                let s=fn(invokeResult.data);
                result[invokeName].result=s;
            }catch (e){
                result[invokeName].result=invokeResult.data;
            }
        }else{
            result[invokeName].result=invokeResult.data;
        }
        result[invokeName].body=data;
        result[invokeName].head=head;
        result[invokeName].url=url;
        if(entity.next){
            let nextEntitys=await this.app.mysql.select('invoke_info',{where: {  id: entity.next.split(',') }});
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
    let Fn = Function;
    return new Fn('return ' + fn)();
}

module.exports = RestfulService;