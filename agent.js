const amqp = require('amqp');

module.exports = agent => {


    agent.messenger.on('egg-ready', () => {
        agent.logger.info('egg-ready');
        const rabbitmqUrl = agent.config.self.rabbitmqUrl;
        const queueName = agent.config.self.queueName;
        const connection = amqp.createConnection({url: rabbitmqUrl});
        const exchangeName = '';
        connection.once('ready', () => {
            agent.logger.info('connection ready');
            const exchange = connection.exchange(exchangeName, {type: 'direct', autoDelete: false});
            agent.messenger.on('rabbitmqMsg', data => {
                agent.logger.info('rabbitmqMsg');
                agent.logger.info(data);
                exchange.publish(queueName, data);
            });
        });

    });


};

