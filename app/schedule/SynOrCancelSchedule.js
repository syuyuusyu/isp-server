const Subscription = require('egg').Subscription;


class SynOrCancelSchedule extends Subscription {
    // 通过 schedule 属性来设置定时任务的执行间隔等配置
    static get schedule() {
        return {
            interval: '3s', // 10 分钟间隔
            type: 'all', // 指定所有的 worker 都需要执行
        };
    }

    //
    async subscribe() {
        //console.log(this.app.SynOrCancelResult);
        let obj = this.app.SynOrCancelResult.shift();
        if (obj) {
            if (obj.type==='result' && obj.count<5){
                this.result(obj);
            }
            if(obj.type==='error' && obj.count<5){
                this.error(obj,false);
            }
            if(obj.type==='invoke'){
                if(obj.count<10){
                    this.app.SynOrCancelResult.push({...obj,count:++obj.count});
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
        console.log('-----------', `${activitiIp}/userTask/${obj.assigneeName}`);
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
            const result = await this.service.restful.invoke(this.app.invokeEntitys.filter(d => d.id === 82)[0], {
                activitiIp: activitiIp,
                taskId: tasks.data[0].id,
                message: message,
            });
            this.app.logger.info(obj.assigneeName+ ' 获取用户推送结果流程完成', result);
        }else if(!del){
            this.app.SynOrCancelResult.push({...obj,count:++obj.count});
        }
    }

    // 平台访问权限申请流程被申请平台调用用户同步结果接口时执行对应的usertask流程
    async result(obj) {
        const activitiIp = this.app.config.self.activitiIp;
        console.log('-----------', `${activitiIp}/userTask/${obj.assigneeName}`);
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

            const result = await this.service.restful.invoke(this.app.invokeEntitys.filter(d => d.id === 82)[0], {
                activitiIp: activitiIp,
                taskId: tasks.data[0].id,
                message: message
            });
            this.app.logger.info(obj.assigneeName+'获取用户推送结果流程完成', result);
        }else {
            this.app.SynOrCancelResult.push({...obj,count:++obj.count});
        }


    }
}

module.exports = SynOrCancelSchedule;
