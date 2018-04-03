const Subscription = require('egg').Subscription;

class InterfacesLog extends Subscription {
    // 通过 schedule 属性来设置定时任务的执行间隔等配置
    static get schedule() {
        return {
            interval: '2s', // 1 分钟间隔
            type: 'all', // 指定所有的 worker 都需要执行
        };
    }

    // subscribe 是真正定时任务执行时被运行的函数
    async subscribe() {
      const interfaceInfo=await this.app.interfaceLog;
      console.log("定时调度中的interfaceInfo的值为：",interfaceInfo);
    }
}

module.exports = InterfacesLog;