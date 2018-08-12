const Service=require('egg').Service;

class RedisService extends Service{

    async get(k) {
        // if(!await this.containKey(k)){
        //     this.app.logger.error('key:'+k+'对应对象不存在');
        //     return;
        // }
        const json = await this.app.redis.get(k);
        return JSON.parse(json);
    }

    async set(k,v){
        await this.app.redis.set(k, JSON.stringify(v));
    }

    async push(k,obj){
        if(!await this.containKey(k)){
            this.app.logger.error('key:'+k+'对应对象不存在');
            return;
        }
        const json=await this.app.redis.get(k);
        const array=JSON.parse(json);
        this.app.logger.info(k,array);
        if(!array.push){
            this.app.logger.error('key:'+k+'对应对应对象不是数组',array);
            return;
        }
        array.push(obj);
        await this.set(k,array);

    }

    async shift(k){
        if(!await this.containKey(k)){
            this.app.logger.error('key:'+k+'对应对象不存在');
            return;
        }
        const json=await this.app.redis.get(k);
        const array=JSON.parse(json);
        if(!array.shift){
            this.app.logger.error('key:'+k+'对应对应对象不是数组',array);
            return;
        }
        const obj=array.shift();
        await this.set(k,array);
        return obj;
    }

    async del(key){
        await this.app.redis.del(key);
    }

    async forEach(k,fn){
        if(!await this.containKey(k)){
            this.app.logger.error('key:'+k+'对应对象不存在');
            return;
        }
        const json=await this.app.redis.get(k);
        const array=JSON.parse(json);
        if(!array.forEach){
            this.app.logger.error('key:'+k+'对应对应对象不是数组',array);
            return;
        }
        array.forEach(fn);
    }

    async setProperty(k,field,v){
        if(!await this.containKey(k)){
            this.app.logger.error('key:'+k+'对应对象不存在');
            return;
        }
        const json=await this.app.redis.get(k);
        const obj=JSON.parse(json);
        obj[field]=v;
        await this.set(k,obj);
    }

    async getProperty(k,field){
        if(!await this.containKey(k)){
            this.app.logger.error('key:'+k+'对应对象不存在');
            return;
        }
        const json=await this.app.redis.get(k);
        const obj=JSON.parse(json);
        return obj[field];
    }

    async splice(k,index,length){
        if(!await this.containKey(k)){
            this.app.logger.error('key:'+k+'对应对象不存在');
            return;
        }
        const json=await this.app.redis.get(k);
        const array=JSON.parse(json);
        if(!array.splice){
            this.app.logger.error('key:'+k+'对应对应对象不是数组',array);
            return;
        }
        array.splice(index,length);
        await this.set(k,array);
    }

    async containKey(key){
        const keys=await this.app.redis.keys('*');
        return keys.filter(k=>k===key).length>0;
    }


}

module.exports = RedisService;