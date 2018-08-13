function smartQuery(target, name, descriptor){

}

function log(target, name, descriptor) {
    var oldValue = descriptor.value;

    descriptor.value = function() {
        target.ctx.logger.info(`Calling ${name} with`, arguments);
        return oldValue.apply(this, arguments);
    };
    return descriptor;
}


module.exports={smartQuery,log};