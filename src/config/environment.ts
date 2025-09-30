/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import 'dotenv/config';

import * as joi from 'joi';

interface Environment {
  PORT: number;

  // Database
  DB_HOST: string;
  DB_PORT: number;
  DB_USER: string;
  DB_PASSWORD: string;
  DB_NAME: string;

  // RabbitMQ
  RABBITMQ_URL: string;
  RABBITMQ_QUEUE: string;
  MP_SERVICE_NAME: string;
}

const envSchema = joi
  .object({
    PORT: joi.number().integer().min(1).max(65535).default(3000),
    DB_HOST: joi.string().required(),
    DB_PORT: joi.number().required().default(3306),
    DB_USER: joi.string().required(),
    DB_PASSWORD: joi.string().required(),
    DB_NAME: joi.string().required(),

    RABBITMQ_URL: joi.string().uri().default('amqp://localhost:5672'),
    RABBITMQ_QUEUE: joi.string().default('messages_processor_queue'),
    MP_SERVICE_NAME: joi.string().default('MESSAGES_PROCESSOR_SERVICE'),
  })
  .unknown(true);

const { error, value } = envSchema.validate(process.env);

if (error) {
  throw new Error(`Environment validation error: ${error.message}`);
}

const envVars: Environment = value;

export const environment = {
  port: envVars.PORT,
  db: {
    host: envVars.DB_HOST,
    port: envVars.DB_PORT,
    user: envVars.DB_USER,
    password: envVars.DB_PASSWORD,
    name: envVars.DB_NAME,
  },
  rabbitmq: {
    url: envVars.RABBITMQ_URL,
    queue: envVars.RABBITMQ_QUEUE,
  },
  mp: {
    serviceName: envVars.MP_SERVICE_NAME,
  },
};
