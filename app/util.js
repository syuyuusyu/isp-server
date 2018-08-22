
const toString=Object.prototype.toString;
const isFunction=function(v){
    return toString.call(v)=="[object Function]";
}

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

Function.prototype.createInterceptor=Function.prototype.createInterceptor?Function.prototype.createInterceptor
    :function(fn,scope){
        var method=this;
        return !isFunction(fn)?
            this:
            function(){
                var me=this,
                    arg=arguments;
                return (fn.apply(scope||me||global,arg)!==false)?
                    method.apply(me||global,arg):
                    null;
            }
    };

Function.prototype.replaceArguments=Function.prototype.replaceArguments?Function.prototype.replaceArguments
    :function(fn){
        var method=this;
        return !isFunction(fn)?
            this:
            function(){
                var me=this,
                    arg=arguments;
                return method.apply(me||global,fn.apply(null,arg));
            }
    };

// Object.prototype.forEach=Object.prototype.forEach?Object.prototype.forEach:
//     function(fn){
//         Object.keys(this).forEach(key=>{
//             fn(key,this[key]);
//         })
//     };


function smartQuery(target, name, descriptor) {
    var oldValue = descriptor.value;

    descriptor.value = function() {
        const oldquery=this.app.mysql.query;

        return (function(_this,arg,_oquery){
            _this.app.mysql.query=_this.app.mysql.query.replaceArguments(function(sql,paramsArr){
                const newArg=[];
                sql=sql.replace(/((?:where|and)\s+[\w\.]+\s*=\s*\?)|((?:where|and)\s+[\w\.]+\s+in\s*\(\s*\?\s*\))/g,(w)=>{
                    let current=paramsArr.shift();
                    if(current){
                        newArg.push(current);
                        return w;
                    }else{
                        return '';
                    }
                });
                if(!/where/.test(sql)){
                    sql=sql.replace('and','where');
                }
                //console.log(sql);
                //console.log(newArg);
                return [sql,newArg];
            });
            return new Promise(function(resolve, reject){
                resolve(oldValue.apply(_this, arg));

            }).then(function(){
                _this.app.mysql.query=_oquery;
            });

        })(this,arguments,oldquery)
    };
    return descriptor;
}

module.exports={smartQuery};