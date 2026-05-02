import {randomUUID} from 'crypto';
import {LogEntry, LogLevel, LogPackage, LoggerOptions} from './types';
import {validateLogEntry} from './validator';
import {sendLogPayload} from './apiClient';

const DEFAULT_LOG_API_URL = process.env.LOG_API_URL ?? '';
const DEFAULT_ACCESS_TOKEN = process.env.ACCESS_TOKEN ?? '';

function resolveOptions(options?: LoggerOptions): LoggerOptions {
  if (options?.logApiUrl && options?.accessToken) {
    return options;
  }

  if (!DEFAULT_LOG_API_URL || !DEFAULT_ACCESS_TOKEN) {
    throw new Error('Logging environment variables are required');
  }

  return {
    logApiUrl: DEFAULT_LOG_API_URL,
    accessToken: DEFAULT_ACCESS_TOKEN,
  };
}

function buildEntry(
  stack: 'backend',
  level: LogLevel,
  packageName: LogPackage,
  message: string,
  requestId?: string,
  metadata?: Record<string, unknown>,
): LogEntry {
  return {
    stack,
    level,
    package: packageName,
    message,
    timestamp: new Date().toISOString(),
    requestId: requestId ?? randomUUID(),
    metadata,
  };
}

export async function Log(
  stack: 'backend',
  level: LogLevel,
  packageName: LogPackage,
  message: string,
  requestId?: string,
  metadata?: Record<string, unknown>,
): Promise<void> {
  const options = resolveOptions();
  const payload = buildEntry(stack, level, packageName, message, requestId, metadata);

  validateLogEntry(payload);

  try {
    await sendLogPayload(payload, options.logApiUrl, options.accessToken);
  } catch {
    // Silent fallback: do not crash the application.
  }
}

export class Logger {
  private readonly options: LoggerOptions;

  constructor(options: LoggerOptions) {
    this.options = resolveOptions(options);
  }

  public async log(
    stack: 'backend',
    level: LogLevel,
    packageName: LogPackage,
    message: string,
    requestId?: string,
    metadata?: Record<string, unknown>,
  ): Promise<void> {
    const payload = buildEntry(stack, level, packageName, message, requestId, metadata);
    validateLogEntry(payload);

    try {
      await sendLogPayload(payload, this.options.logApiUrl, this.options.accessToken);
    } catch {
      // Silent fallback: preserve application flow.
    }
  }
}

/*
Example usage:
import {Log} from './logging_middleware';

void Log('backend', 'error', 'handler', 'Invalid input received');
*/
