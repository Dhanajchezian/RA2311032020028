import {LogEntry, LogLevel, LogPackage, LogStack} from './types';

const allowedStacks: LogStack[] = ['backend'];
const allowedLevels: LogLevel[] = ['debug', 'info', 'warn', 'error', 'fatal'];
const allowedPackages: LogPackage[] = [
  'cache',
  'controller',
  'cron_job',
  'db',
  'domain',
  'handler',
  'repository',
  'route',
  'service',
  'shared',
  'auth',
  'config',
  'middleware',
  'utils',
];

export function validateLogEntry(entry: Partial<LogEntry>): asserts entry is LogEntry {
  if (!allowedStacks.includes(entry.stack as LogStack)) {
    throw new TypeError('Invalid stack: only "backend" is allowed');
  }

  if (!allowedLevels.includes(entry.level as LogLevel)) {
    throw new TypeError(
      `Invalid level: ${entry.level}. Allowed values: ${allowedLevels.join(', ')}`,
    );
  }

  if (!allowedPackages.includes(entry.package as LogPackage)) {
    throw new TypeError(
      `Invalid package: ${entry.package}. Allowed values: ${allowedPackages.join(', ')}`,
    );
  }

  if (typeof entry.message !== 'string' || entry.message.trim().length === 0) {
    throw new TypeError('Invalid message: expected a non-empty string');
  }

  if (typeof entry.timestamp !== 'string' || entry.timestamp.trim().length === 0) {
    throw new TypeError('Invalid timestamp: expected a non-empty ISO string');
  }

  if (typeof entry.requestId !== 'string' || entry.requestId.trim().length === 0) {
    throw new TypeError('Invalid requestId: expected a non-empty string');
  }

  if (
    entry.metadata !== undefined &&
    (typeof entry.metadata !== 'object' || Array.isArray(entry.metadata))
  ) {
    throw new TypeError('Invalid metadata: expected an object');
  }
}
