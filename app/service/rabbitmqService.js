const Service=require('egg').Service;

class RabbitmqService extends Service{

    queue(queue){
        console.log('Queue ' + queue.name + ' is open!');
        queue.subscribe( (message, header, deliveryInfo) =>{
            if (message.data) {
                var messageText = message.data.toString();
                console.log(messageText);
                if (messageText === "quit") bStop = true;
            }
        });

        console.log(queue);
    }


}

module.exports = RabbitmqService;
