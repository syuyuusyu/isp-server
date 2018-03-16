const Controller=require('egg').Controller;



class RestfulController extends Controller{

    async toPage(){
        await this.ctx.render('restful/invokeEntityInfo.tpl');
    }

    async infos(){

        console.log(this.ctx.request.body);
        const {page,start,limit,invokeName}=this.ctx.request.body;
        let where=(invokeName && !/\s/.test(invokeName))?{name:invokeName}:{};
        let wherecount=(invokeName && !/\s/.test(invokeName))?`where name='${invokeName}'`:'';
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
        console.log(entity);
        if(entity.id){
            result = await this.app.mysql.update('invoke_info', entity);
        }else {
            result = await this.app.mysql.insert('invoke_info', entity); // 更新 posts 表中的记录
        }
        // 判断更新成功
        console.log(result);
        const updateSuccess = result.affectedRows === 1;
        this.ctx.body={success:updateSuccess};
    }

    async invokes(){
        this.ctx.body=await this.app.mysql.select('invoke_info',{});
    }

    async test(){
        const entity=this.ctx.request.body;
        console.log(entity);
        this.ctx.body=await this.service.restful.invoke(entity,entity.queryMap);
    }

    async invoke(){
        const queryMap=this.ctx.request.body;
        const [entity]=await this.app.mysql.select('invoke_info',{where: {  name: this.ctx.params.invokeName}});
        let result=[];
        let nextEntitys=await this.app.mysql.select('invoke_info',{where: {  id: entity.next.split(',') }});
        for(let entity of nextEntitys){
            let r=await this.service.restful.invoke(entity,queryMap);
            const cur={};
            for(let invokeName in r){
                console.log(invokeName);
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
}

function evil(fn) {
    fn.replace(/(\s?function\s?)(\w?)(\s?\(w+\)[\s|\S]*)/g,function(w,p1,p2,p3){
        return p1+p3;
    });
    let Fn = Function;
    return new Fn('return ' + fn)();
}

module.exports=RestfulController;