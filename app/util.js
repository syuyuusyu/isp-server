
const toString=Object.prototype.toString;
const isFunction=function(v){
    return toString.call(v)=="[object Function]";
};

const isObj=function(v){
    return toString.call(v)=="[object Object]";
};

const isArrsy=function(v){
    return toString.call(v)=="[object Array]";
};

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
                    arg=arguments,
                    args=fn.apply(null,arg);
                return method.apply(me||global,args);
            }
    };

Array.prototype.shuffle = function() {
    for(var j, x, i = this.length; i; j = parseInt(Math.random() * i), x = this[--i], this[i] = this[j], this[j] = x);
    return this;
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
            _this.app.mysql.modify=true;
            _this.app.mysql.query=_this.app.mysql.query.replaceArguments(function(sql,paramsArr){
                const newArg=[],paramsArrClone=[].concat(paramsArr)
                sql=sql.replace(/((?:where|and)\s+[\w\.]+\s*(?:=|<>|<|>)\s*\?)|((?:where|and)\s+[\w\.]+\s+(?:not\s+)?in\s*\(\s*\?\s*\))/g,(w)=>{
                    let current=paramsArrClone.shift();
                    if(current){
                        newArg.push(current);
                        return w;
                    }else{
                        return '';
                    }
                });
                if(!/\swhere\s/.test(sql)){
                    //sql=sql.replace('and','where');
                }
                return [sql,newArg];
            });
            return new Promise(function(resolve, reject){
                resolve(oldValue.apply(_this, arg));

            }).then(function(response){
                _this.app.mysql.query=_oquery;
                _this.app.mysql.modify=false;
                return response;
            });

        })(this,arguments,oldquery)
    };
    return descriptor;
}

function lowCaseResult(target, name, descriptor) {
    var oldValue = descriptor.value;
    descriptor.value=function(){
        var me=this;
        var arg=arguments;
        return new Promise(async function(resolve,reject){
            resolve(oldValue.apply(me, arg));
        }).then(function(response){
            if(isObj(response)){
                response=_lowCaseObj(response);
            }else if(isArrsy(response)){
                response=_lowCaseArray(response);
            }else {
                response=response;
            }
            return response;
        });

    }
}

function lowCaseResponseBody(target, name, descriptor) {
    var oldValue = descriptor.value;
    descriptor.value=function(){
        var me=this;
        var arg=arguments;
        return new Promise(async function(resolve,reject) {
            resolve(oldValue.apply(me, arg));
        }).then(function(){
            let result=me.ctx.body;
            if(isObj(result)){
                result=_lowCaseObj(result);
            }else if(isArrsy(result)){
                result=_lowCaseArray(result);
            }else {
                result=result;
            }
            me.ctx.body=result;
        });

    }
}

function _lowCaseObj(target){
    let result={};
    for(let key in target){
        if(isObj(target[key])){
            result[key.toLowerCase()]=_lowCaseObj(target[key]);
        }else if(isArrsy(target[key])){
            result[key.toLowerCase()]=_lowCaseArray(target[key]);
        }else{
            result[key.toLowerCase()]=target[key];
        }
    }
    return result;
}

function _lowCaseArray(arr){
    let result=[];
    for(let i=0;i<arr.length;i++){
        if(isObj(arr[i])){
            result.push(_lowCaseObj(arr[i]))
        }else if(isArrsy(arr[i])){
            result.push(_lowCaseArray(arr[i]))
        }else{
            result.push(arr[i]);
        }
    }
    return result;
}


function careateTree(array,idField,pidField,topId) {
    function _tree(arr) {
        const leafArray=[];
        arr.forEach(_=>{
            if(arr.filter(a=>a[pidField]===_[idField]).length===0){
                leafArray.push(_);
            }
        });
        if(leafArray.findIndex(_=>_[pidField]==topId)===-1){
            leafArray.forEach(_=>arr.remove(_));
            leafArray.forEach(_=>{
                for(let i=0;i<arr.length;i++){
                    if(arr[i][idField]===_[pidField]){
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
    _tree(array);
    return array;

}

module.exports={smartQuery,lowCaseResult,lowCaseResponseBody,careateTree};