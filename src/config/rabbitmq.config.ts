// import { RmqOptions, Transport } from '@nestjs/microservices';
// import { environment } from './environment';

// export const rabbitmqConfig = (queue: string = 'default_queue'): RmqOptions => ({
//   transport: Transport.RMQ,
//   options: {
//     urls: [environment.rabbitmq.url],
//     queue,
//     queueOptions: {
//       durable: true,
//     },
//   },
// });