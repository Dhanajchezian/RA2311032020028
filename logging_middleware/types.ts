export type LogStack = 'backend';
export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';
export type LogPackage =
  | 'cache'
  | 'controller'
  | 'cron_job'
  | 'db'
  | 'domain'
  | 'handler'
  | 'repository'
  | 'route'
  | 'service'
  | 'shared'
  | 'auth'
  | 'config'
  | 'middleware'
  | 'utils';

export interface LogEntry {
  stack: LogStack;
  level: LogLevel;
  package: LogPackage;
  message: string;
  timestamp: string;
  requestId: string;
  metadata?: Record<string, unknown>;
}

export interface LoggerOptions {
  logApiUrl: string;
  accessToken: string;
}
