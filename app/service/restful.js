const Service = require('egg').Service;
const EventEmitter = require('events').EventEmitter;
const fs = require('fs');

class RestfulService extends Service {

    constructor(ctx) {
        super(ctx);
        Object.assign(this, EventEmitter.prototype);
    }

    async invoke(entity, queryObj) {
        let count = 1,
            recursionLevel = 1,
            lastinvokeName = entity.name,
            result = {};

        await this._invoke(entity, queryObj, count, result, recursionLevel, lastinvokeName);
        return result;
    }

    async _invoke(entity, queryObj, count, result, recursionLevel, lastinvokeName) {
        let invokeName = '';
        (lastinvokeName + '-' + count).replace(/(?=\S+)((?:-\d+)+)/, (w, p1) => {
            invokeName = entity.name + p1;
            return entity.name + p1;
        });
        result[invokeName] = {};
        let url = this.parseByqueryMap(entity.url, queryObj);
        let method = entity.method.toUpperCase();
        let data = this.parseByqueryMap(entity.body, queryObj);
        data = JSON.parse(data);
        let head = this.parseByqueryMap(entity.head, queryObj);
        head = JSON.parse(head);
        this.ctx.logger.info('url:', url);
        this.ctx.logger.info('method:', method);
        this.ctx.logger.info('head:', head);
        this.ctx.logger.info('body:', data);


        let invokeResult;
        try {
            invokeResult = await this.app.curl(url, {
                method: method,
                data: data,
                headers: head,
                dataType: 'json',
                timeout: 20000,
            });
            // invokeResult = await this.app.curl('https://20.18.6.16/report/alarmtype?action=totaleventlist&format=json&timeAgo=m0&begin=&end=&token=7b849d0f-8303-43ca-b239-6312d31a0e9a', {
            //     //data: { username: 'admin', password: '111111' },
            //     method: 'GET',
            //     data: data,
            //     headers: {
            //         'Cookie': 'secneflag=0; JSESSIONID=E535475F0EB4B68B1D4B309A10A9A1B3',
            //     },
            //     dataType: 'json',
            //     timeout: 20000
            // });
        } catch (e) {
            this.ctx.logger.error('调用接口错误!!', url);
            //this.ctx.logger.info(invokeResult);
            this.ctx.logger.info(e);
            //throw e;
            invokeResult = {
                data: {
                    'msg': '调用接口错误!!',
                    'url': url,
                    'method:': method,
                    'head:': head,
                    'body:': data,
                    'description': e.toString(),
                }
            }

        }
        //this.ctx.logger.info('status',invokeResult.status);
        //this.ctx.logger.info('result',invokeResult.data);
        if (entity.parseFun) {
            try {
                let fn = evil(entity.parseFun);
                let s = fn(invokeResult.data, invokeResult.headers, invokeResult.status, head, data, url);
                //response,responsehead,responsestatus,requesthead,requestdata,url
                result[invokeName].result = s;
            } catch (e) {
                this.ctx.logger.error('运行解析函数错误');
                this.ctx.logger.info('response,responsehead,responsestatus,requesthead,requestdata,url');
                this.ctx.logger.info('解析参数\n', '----->\n', invokeResult.data, '\n', invokeResult.headers, '\n', invokeResult.status, '\n', head, '\n', data, '\n', url, '<------\n');
                this.ctx.logger.info('解析析函', entity.parseFun);
                result[invokeName].result = invokeResult.data;
            }
        } else {
            result[invokeName].result = invokeResult.data;
        }

        result[invokeName].body = data;
        result[invokeName].head = head;
        result[invokeName].url = url;
        if (entity.next && result[invokeName].result.map) {
            recursionLevel++;
            const invokeEntitys = await this.ctx.service.redis.get('invokeEntitys');
            let nextEntitys =//await this.app.mysql.select('t_invoke_info',{where: {  id: entity.next.split(',') }});
                invokeEntitys.filter(d => {
                    let flag = false;
                    entity.next.split(',').forEach(i => {
                        if (i === d.id + '') {
                            flag = true;
                        }
                    });
                    return flag;
                });

            for (let netxEn of nextEntitys) {
                let currentCount = count;
                let promises = result[invokeName].result.map(r => {
                    currentCount++;
                    let currentQurtyObj = {};
                    Object.assign(currentQurtyObj, queryObj);
                    let queryParams = this.queryParams(netxEn);
                    queryParams.forEach(p => {
                        if (r[p]) {
                            currentQurtyObj[p] = r[p];
                        }
                    });
                    return this._invoke(netxEn, currentQurtyObj, currentCount, result, recursionLevel, invokeName);

                });
                await Promise.all(promises);
            }
        }
    }

    parseByqueryMap(str, queryMap) {
        return str.replace(/(@(\w+))/g, (w, p1, p2) => {
            return queryMap[p2] ? queryMap[p2] : p1;
        });
    };

    queryParams(entity) {
        let queryStr = '' + entity.url + entity.head + entity.body;
        let params = [];
        queryStr.replace(/@(\w+)/g, (w, p1) => {
            params.push(p1);
        });
        return params;
    }
}

function evil(fn) {
    fn.replace(/(\s?function\s?)(\w?)(\s?\(w+\)[\s|\S]*)/g, function (w, p1, p2, p3) {
        return p1 + p3;
    });
    let Fun = Function;
    return new Fun('return ' + fn)();
}

module.exports = RestfulService;


