import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

function parsePort(value: string | undefined): number {
  const port = Number(value ?? '');
  if (Number.isNaN(port) || port <= 0) {
    throw new Error('Invalid PORT; expected a positive number');
  }
  return port;
}

const port = parsePort(process.env.PORT);

if (!process.env.LOG_API_URL) {
  throw new Error('Missing LOG_API_URL environment variable');
}

if (!process.env.ACCESS_TOKEN) {
  throw new Error('Missing ACCESS_TOKEN environment variable');
}

export const config = {
  PORT: port,
  LOG_API_URL: process.env.LOG_API_URL,
  ACCESS_TOKEN: process.env.ACCESS_TOKEN,
};
