const express = require('express');
const amqp = require('amqplib');
const app = express();
const port = 3000;

async function connectToRabbitMQ() {
  try {
    const connection = await amqp.connect('amqp://localhost');
    const channel = await connection.createChannel();
    const queue = 'tasks_queue';

    await channel.assertQueue(queue, { durable: true });

    return channel;
  } catch (error) {
    console.error('Ошибка подключения к RabbitMQ:', error);
    process.exit(1);
  }
}

app.get('/', async (req, res) => {
  const task = {
    taskData: { message: "задача" },
  };

  try {
    const channel = await connectToRabbitMQ();
    const queue = 'tasks_queue';
    const message = JSON.stringify(task);

    channel.sendToQueue(queue, Buffer.from(message), { persistent: true });

    channel.close();
    res.send('Письмо успешно отправлено на обработку');
  } catch (error) {
    console.error('Ошибка при отправке задания в RabbitMQ:', error);
    res.status(500).send('Ошибка сервера');
  }
});

app.listen(port, () => {
  console.log(`Микросервис М1 запущен на ${port} порте`);
});