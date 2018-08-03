module.exports = app => {
    app.beforeStart(async () => {
        // 应用会等待这个函数执行完成才启动
        app.logger.info('init app');
        app.logger.info(app.config.discription);
        Array.prototype.indexOf = Array.prototype.indexOf ? Array.prototype.indexOf
            : function(o, from)  {
                from = from || 0;
                var len = this.length;
                from += (from < 0) ? len : 0;
                for (; from < len; from++) {
                    if (this[from] === o)
                        return from;
                }
                return -1;
            };

        Array.prototype.remove = Array.prototype.remove ? Array.prototype.remove
            : function(o)  {
                let index = this.indexOf(o);
                if (index != -1) {
                    this.splice(index, 1);
                }
            };


        // Object.prototype.forEach=Object.prototype.forEach?Object.prototype.forEach:
        //     function(fn){
        //         Object.keys(this).forEach(key=>{
        //             fn(key,this[key]);
        //         })
        //     };



        app.secret = 'n7d3t7x7';
        const ctx = app.createAnonymousContext();


        // 同步集成用户角色到流程引擎
        //ctx.service.authorService.actSynUser();
        //await app.runSchedule('inital');
        let ids=await ctx.service.saveOrDelete.childList(21,'id','parent_id','t_menu');
        console.log(ids);

        app.logger.info('app started!!!!');
    });

    app.once('server', async server => {

    });

    app.messenger.on('xxx_action', data => {
        app.logger.info('xxx_action',data);
    });
};







