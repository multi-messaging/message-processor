/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import 'dotenv/config';

import * as joi from 'joi';

interface Environment {
  PORT: number;
  //RABBITMQ_URL: string;

  // Database
  DB_HOST: string;
  DB_PORT: number;
  DB_USER: string;
  DB_PASSWORD: string;
  DB_NAME: string;
}

const envSchema = joi
  .object({
    PORT: joi.number().integer().min(1).max(65535).default(3000),
    DB_HOST: joi.string().required(),
    DB_PORT: joi.number().required().default(3306),
    DB_USER: joi.string().required(),
    DB_PASSWORD: joi.string().required(),
    DB_NAME: joi.string().required(),
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
};
