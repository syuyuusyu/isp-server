const Subscription = require('egg').Subscription;


class KeyverifyToken extends Subscription {
    // 通过 schedule 属性来设置定时任务的执行间隔等配置
    static get schedule() {
        return {
            cron: '0 0 1 * * *',
            immediate:false,
            type: 'worker',
        };
    }

    //
    async subscribe() {
        this.app.logger.info('KeyverifyToken');
        this.app.logger.info(ctx.service.authorService.invokePromiss);
        const ip = require("ip");
        if ( ip.address() != '10.100.30.15' && this.app.config.discription=='production'){
            return
        }
        let systems = await this.app.mysql.query(`select * from t_system where stateflag =1`);

        for (const system of systems) {
            let token = this.service.interfaces.randomString();
            await this.app.mysql.update('t_system', {id:system.id,keyverify_token:token});
        }
        // 初始化系统调用接口权限
        await this.service.authorService.invokePromiss();



    }


}

module.exports = KeyverifyToken;
