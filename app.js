'use strict';
require('./app/util');
require("babel-register");

// const rootCas = require('ssl-root-cas/latest').create();
//
// rootCas.addFile('/Users/syu/.ssh/yndk/yndk.crt');
// require('https').globalAgent.options.rejectUnauthorized = false;


console.log(__dirname);


module.exports = app => {
    app.beforeStart(async () => {
        // 应用会等待这个函数执行完成才启动
        app.logger.info('init app');
        app.logger.info(app.config.discription);
        app.secret = 'n7d3t7x7';

        const old=app.curl;
        app.curl=(url,options)=>{
            return new Promise(function (resolve, reject) {
                resolve(old.apply(app,[url,{...options,rejectUnauthorized : false}]))
            } )
        };


        const ctx = app.createAnonymousContext();



        // 同步集成用户角色到流程引擎
        //ctx.service.authorService.actSynUser();
        app.mysql.modify = false;

        //ctx.service.organization.createGovOrg();
        //await ctx.service.organization.delete();


    });

    app.once('server', async server => {
        const ctx = app.createAnonymousContext();
        //实体配置缓存
        await ctx.service.entity.entityCache();
    });

    //实体配置信息缓存
    app.messenger.on('entityCache', data => {
        console.log('entityCache');
        app.entityCache = data;
    });
};


function careateTree(array) {
    function _tree(arr) {
        const leafArray=[];
        arr.forEach(_=>{
            if(arr.filter(a=>a['PID']===_['ID']).length===0){
                leafArray.push(_);
            }
        });
        if(leafArray.length>0 && leafArray.findIndex(_=>_['PID']===null)===-1){
            leafArray.forEach(_=>arr.remove(_));
            leafArray.forEach(_=>{
                for(let i=0;i<arr.length;i++){
                    if(arr[i]['ID']===_['PID']){
                        if(!arr[i].children){
                            arr[i].children=[];
                        }
                        arr[i].children.push(_);
                    }
                }
            });
            _tree(arr);
        }
    }
    const obj=array;
    _tree(obj);
    return obj;
}
