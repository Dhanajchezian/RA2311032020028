import path from 'path';
import dotenv from 'dotenv';

const envPath = path.resolve(__dirname, '../../../.env');
dotenv.config({ path: envPath });

if (!process.env.SCHEDULER_API_BASE_URL) {
  throw new Error('Missing SCHEDULER_API_BASE_URL environment variable');
}

export const schedulerConfig = {
  apiBaseUrl: process.env.SCHEDULER_API_BASE_URL,
  depotPath: process.env.SCHEDULER_DEPOT_PATH ?? '/depot',
  vehiclesPath: process.env.SCHEDULER_VEHICLES_PATH ?? '/vehicles',
};
