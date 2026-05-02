import axios, {AxiosError} from 'axios';
import {LogEntry} from './types';

const REQUEST_TIMEOUT_MS = 3000;
const MAX_ATTEMPTS = 2;

export async function sendLogPayload(
  payload: LogEntry,
  logApiUrl: string,
  accessToken: string,
): Promise<void> {
  const headers = {
    Authorization: `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  };

  let lastError: Error | string = 'Unknown logging failure';

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    try {
      await axios.post(logApiUrl, payload, {
        headers,
        timeout: REQUEST_TIMEOUT_MS,
      });
      return;
    } catch (error) {
      if (isAxiosError(error)) {
        lastError = error.message;
      } else if (error instanceof Error) {
        lastError = error.message;
      } else {
        lastError = String(error);
      }

      if (attempt === MAX_ATTEMPTS) {
        throw new Error(String(lastError));
      }
    }
  }
}

function isAxiosError(error: unknown): error is AxiosError {
  return !!(error && typeof error === 'object' && 'isAxiosError' in error);
}
