const Controller=require('egg').Controller;



class RestfulController extends Controller{

    async toPage(){
        await this.ctx.render('restful/invokeEntityInfo.tpl');
    }

    async infos(){

        console.log(this.ctx.request.body);
        const {page,start,limit,invokeName,groupName}=this.ctx.request.body;
        let where=(invokeName && !/\s/.test(invokeName))?{name:invokeName}:{};
        where=(groupName && !/\s/.test(groupName))?{...where,groupName:groupName}:where;
        let wherecount=(invokeName && !/\s/.test(invokeName))?`where name='${invokeName}'`:'where 1=1';
        wherecount=wherecount+((groupName && !/\s/.test(groupName))?` and groupname='${groupName}'`:'');
        console.log(wherecount);
        console.log(page,start,limit,invokeName);
        let result={};
        let [{total}]=await this.app.mysql.query(`select count(1) total from invoke_info ${wherecount}`, []);
        let [...content]=await this.app.mysql.select('invoke_info',{
            limit: limit,
            offset: start,
            where
        });
        result.totalElements=total;
        result.content=content;
        //console.log(result);
        this.ctx.body=result;
    }

    async save(){
        const entity=this.ctx.request.body;
        let result={};
        if(entity.id){
            result = await this.app.mysql.update('invoke_info', entity);
        }else {
            result = await this.app.mysql.insert('invoke_info', entity); // 更新 posts 表中的记录
        }
        // 判断更新成功
        const updateSuccess = result.affectedRows === 1;
        this.reflashEntity();
        this.ctx.body={success:updateSuccess};
    }

    async invokes(){
        this.ctx.body=await this.app.mysql.select('invoke_info',{});
    }

    async test(){
        const entity=this.ctx.request.body;
        this.ctx.body=await this.service.restful.invoke(entity,entity.queryMap);
    }

    async invoke(){
        const queryMap=this.ctx.request.body;
        const [entity]=this.app.invokeEntitys.filter(d=>d.name===this.ctx.params.invokeName);
            //await this.app.mysql.select('invoke_info',{where: {  name: this.ctx.params.invokeName}});
        let result=[];
        let nextEntitys=this.app.invokeEntitys.filter(d=>{
            let flag=false;
                entity.next.split(',').forEach(i=>{
                    if(i===d.id+''){
                        flag=true;
                    }
                });
                return flag;
            });
            //await this.app.mysql.select('invoke_info',{where: {  id: entity.next.split(',') }});
        for(let entity of nextEntitys){
            let r=await this.service.restful.invoke(entity,queryMap);
            const cur={};
            for(let invokeName in r){
                if(invokeName==='msg' || invokeName==='success'){
                    continue;
                }
                cur[invokeName]=r[invokeName].result;
            }
            result.push(cur);
        }
        if(entity.parseFun){
            try {
                let fn=evil(entity.parseFun);
                result=fn(result);

            }catch (e){
               this.ctx.logger.error(e);
            }
        }else{

        }
        this.ctx.body=result;
    }

    async delete(){
        const result = await this.app.mysql.delete('invoke_info', {
            id: this.ctx.params.id
        });
        const updateSuccess = result.affectedRows === 1;
        this.ctx.body={success:updateSuccess};
    }

    async checkUnique(){
        let [{total}]=await this.app.mysql.query('select count(1) total from invoke_info where name=?' ,[this.ctx.params.invokeName]);
        this.ctx.body={total}
    }

    async reflashEntity(){
        this.app.invokeEntitys=await this.app.mysql.query('select * from invoke_info');
    }

    async groupName(){
        this.ctx.body= await this.app.mysql.query(`select distinct groupName from invoke_info`);
    }

}

function evil(fn) {
    fn.replace(/(\s?function\s?)(\w?)(\s?\(w+\)[\s|\S]*)/g,function(w,p1,p2,p3){
        return p1+p3;
    });
    let Fn = Function;
    return new Fn('return ' + fn)();
}

module.exports=RestfulController;