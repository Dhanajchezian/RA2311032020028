import axios from 'axios';
import {schedulerConfig} from './config/env';
import {Logger} from '../../logging_middleware/logger';
import {DepotPayload, VehiclePayload} from './types';

export const schedulerLogger = new Logger({
  logApiUrl: process.env.LOG_API_URL ?? '',
  accessToken: process.env.ACCESS_TOKEN ?? '',
});

function validateDepotResponse(data: unknown): DepotPayload {
  if (typeof data !== 'object' || data === null) {
    throw new Error('Depot response is not an object');
  }

  const candidate = data as Partial<DepotPayload>;
  if (
    typeof candidate.availableMechanicHours !== 'number' ||
    Number.isNaN(candidate.availableMechanicHours) ||
    candidate.availableMechanicHours < 0
  ) {
    throw new Error('Depot payload missing valid availableMechanicHours');
  }

  return { availableMechanicHours: candidate.availableMechanicHours };
}

function validateVehicle(item: unknown): VehiclePayload {
  if (typeof item !== 'object' || item === null) {
    throw new Error('Vehicle item is not an object');
  }

  const candidate = item as Partial<VehiclePayload>;
  if (typeof candidate.id !== 'string' || candidate.id.trim().length === 0) {
    throw new Error('Vehicle id must be a non-empty string');
  }

  if (
    typeof candidate.duration !== 'number' ||
    Number.isNaN(candidate.duration) ||
    candidate.duration <= 0
  ) {
    throw new Error('Vehicle duration must be a positive number');
  }

  if (
    typeof candidate.impact !== 'number' ||
    Number.isNaN(candidate.impact) ||
    candidate.impact < 0
  ) {
    throw new Error('Vehicle impact must be a non-negative number');
  }

  return {
    id: candidate.id,
    duration: candidate.duration,
    impact: candidate.impact,
  };
}

export async function fetchDepot(): Promise<DepotPayload> {
  const url = `${schedulerConfig.apiBaseUrl}${schedulerConfig.depotPath}`;
  await schedulerLogger.log('backend', 'info', 'service', `Fetching depot data from ${url}`);

  try {
    const response = await axios.get(url, { timeout: 5000 });
    return validateDepotResponse(response.data);
  } catch (error) {
    await schedulerLogger.log('backend', 'error', 'service', 'Depot API request failed', undefined, {
      url,
      reason: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

export async function fetchVehicles(): Promise<VehiclePayload[]> {
  const url = `${schedulerConfig.apiBaseUrl}${schedulerConfig.vehiclesPath}`;
  await schedulerLogger.log('backend', 'info', 'service', `Fetching vehicles data from ${url}`);

  try {
    const response = await axios.get(url, { timeout: 5000 });
    if (!Array.isArray(response.data)) {
      throw new Error('Vehicles response is not an array');
    }

    return response.data.map(validateVehicle);
  } catch (error) {
    await schedulerLogger.log('backend', 'error', 'service', 'Vehicles API request failed', undefined, {
      url,
      reason: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}
