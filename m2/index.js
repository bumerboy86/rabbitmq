const amqp = require('amqplib');

async function connectToRabbitMQ() {
  try {
    const connection = await amqp.connect('amqp://localhost');
    const channel = await connection.createChannel();
    const tasksQueue = 'tasks_queue';
    const resultsQueue = 'results_queue';

    await channel.assertQueue(tasksQueue, { durable: true });

    await channel.assertQueue(resultsQueue, { durable: true });

    channel.consume(tasksQueue, async (message) => {
      try {
        const task = JSON.parse(message.content.toString());

        const result = processTask(task);

        channel.sendToQueue(resultsQueue, Buffer.from(JSON.stringify(result)), { persistent: true });
        channel.ack(message);
      } catch (error) {
        console.error('Ошибка при обработке задания:', error);
        channel.reject(message, false);
      }
    });

    console.log('Сервис М2 готов к обработке заданий');
  } catch (error) {
    console.error('Ошибка подключения к RabbitMQ:', error);
    process.exit(1);
  }
}

function processTask(task) {
    console.log("записано в базуданных", task.taskData);
    return { resultData: `Processed: ${task.taskData}`};
}

connectToRabbitMQ();