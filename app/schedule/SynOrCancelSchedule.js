const Subscription = require('egg').Subscription;


class SynOrCancelSchedule extends Subscription {
    // 通过 schedule 属性来设置定时任务的执行间隔等配置
    static get schedule() {
        return {
            interval: '24h', // 10 分钟间隔
            immediate:false,
            type: 'worker',
        };
    }

    //
    async subscribe() {
        let SynOrCancelResult=await this.ctx.service.redis.get('SynOrCancelResult');
        if(SynOrCancelResult && SynOrCancelResult.length>0){
            this.app.logger.info('SynOrCancelSchedule',SynOrCancelResult);
        }else {
            this.ctx.service.redis.set('SynOrCancelResult',[]);
            return;
        }

        let obj = await this.ctx.service.redis.shift('SynOrCancelResult');
        if (obj) {
            if (obj.type==='result' && obj.count<5){
                this.result(obj);
            }
            if(obj.type==='error' && obj.count<5){
                this.error(obj,false);
            }
            if(obj.type==='invoke'){
                if(obj.count<10){
                    await this.ctx.service.redis.push('SynOrCancelResult',{...obj,count:++obj.count});
                }else{
                    this.error(obj,true);
                }
            }
            if(obj.type==='noPath' && obj.count<5){
                this.error(obj,false);
            }
        }
    }

    async error(obj,del){
        const activitiIp = this.app.config.self.activitiIp;
        this.app.logger.info('-----------', `${activitiIp}/userTask/${obj.assigneeName}`);
        const tasks = await this.app.curl(`${activitiIp}/userTask/${obj.assigneeName}`, {
            method: 'GET',
            head: {
                Accept: 'application/json',
                'Content-Type': 'application/json;charset=UTF-8',
            },
            dataType: 'json',
        });
        if (tasks.status === 200 && tasks.data.length > 0) {

            let {data: {data: message}} = await this.app.curl(`${activitiIp}/userTask/variables/${tasks.data[0].id}/message`, {
                method: 'GET',
                dataType: 'json',
            });
            message = `${message} ${obj.message}`;
            const invokeEntitys=await this.ctx.service.redis.get('invokeEntitys');
            const result = await this.service.restful.invoke(invokeEntitys.filter(d => d.id === 82)[0], {
                activitiIp: activitiIp,
                taskId: tasks.data[0].id,
                message: message,
            });
            this.app.logger.info(obj.assigneeName+ ' 获取用户推送结果流程完成', result);
        }else if(!del){
            await this.ctx.service.redis.push('SynOrCancelResult',{...obj,count:++obj.count});
        }
    }

    // 平台访问权限申请流程被申请平台调用用户同步结果接口时执行对应的usertask流程
    async result(obj) {
        const activitiIp = this.app.config.self.activitiIp;
        this.app.logger.info('-----------', `${activitiIp}/userTask/${obj.assigneeName}`);
        const tasks = await this.app.curl(`${activitiIp}/userTask/${obj.assigneeName}`, {
            method: 'GET',
            head: {
                Accept: 'application/json',
                'Content-Type': 'application/json;charset=UTF-8',
            },
            dataType: 'json',
        });
        if (tasks.status === 200 && tasks.data.length > 0) {

            let {data: {data: message}} = await this.app.curl(`${activitiIp}/userTask/variables/${tasks.data[0].id}/message`, {
                method: 'GET',
                dataType: 'json',
            });
            let opMessage = '',
                succMsg = '';
            if (obj.opType === 'apply') {
                opMessage = '申请';
            } else {
                opMessage = '注销';
            }
            if (obj.status == '801') {
                succMsg = '成功';
            } else {
                succMsg = '失败,该系统拒绝了请求';
            }
            message = `${message} ${opMessage}${obj.systemName}权限${succMsg}`;
            const invokeEntitys=await this.ctx.service.redis.get('invokeEntitys');
            const result = await this.service.restful.invoke(invokeEntitys.filter(d => d.id === 82)[0], {
                activitiIp: activitiIp,
                taskId: tasks.data[0].id,
                message: message
            });
            this.app.logger.info(obj.assigneeName+'获取用户推送结果流程完成', result);
        }else {
            await this.ctx.service.redis.push('SynOrCancelResult',{...obj,count:++obj.count});
        }


    }
}

module.exports = SynOrCancelSchedule;
