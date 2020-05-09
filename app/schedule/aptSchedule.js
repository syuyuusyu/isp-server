const Subscription = require('egg').Subscription;

class AptSchedule extends Subscription {
    static get schedule() {
        return {
            interval: '18m', // 20 分钟间隔
            type: 'worker', // 指定所有的 worker 都需要执行
            immediate: true,
        };
    }
    // subscribe 是真正定时任务执行时被运行的函数
    async subscribe() {
        console.log('AptSchedule')
        const invokeEntitys = await this.service.redis.get('invokeEntitys');
        let [entity] = invokeEntitys.filter(d => d.name === 'aptlogin');
        let result = await this.service.restful.invoke(entity, {});
        let cookie = result['aptlogin-1']['result'].Cookie;
        let token = result['aptlogin-1']['result'].token;
        this.app.redis.set(`aptCookie`, cookie, 'Ex', 60 * 20);
        this.app.redis.set(`aptToken`, token, 'Ex', 60 * 20);
    }
}
module.exports = AptSchedule;
