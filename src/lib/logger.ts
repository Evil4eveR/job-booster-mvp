/**
 * Structured logging utility for BewerbungGenie.
 * Provides consistent log formatting with levels, context, and timestamps.
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  context?: string;
  data?: Record<string, unknown>;
  timestamp: string;
}

function formatLogEntry(
  level: LogLevel,
  message: string,
  context?: string,
  data?: Record<string, unknown>
): LogEntry {
  return {
    level,
    message,
    context,
    data,
    timestamp: new Date().toISOString(),
  };
}

function shouldLog(level: LogLevel): boolean {
  const envLevel = (process.env.LOG_LEVEL || 'info').toLowerCase() as LogLevel;
  const levels: LogLevel[] = ['debug', 'info', 'warn', 'error'];
  return levels.indexOf(level) >= levels.indexOf(envLevel);
}

export const logger = {
  debug(message: string, context?: string, data?: Record<string, unknown>): void {
    if (!shouldLog('debug')) return;
    const entry = formatLogEntry('debug', message, context, data);
    console.debug(JSON.stringify(entry));
  },

  info(message: string, context?: string, data?: Record<string, unknown>): void {
    if (!shouldLog('info')) return;
    const entry = formatLogEntry('info', message, context, data);
    console.info(JSON.stringify(entry));
  },

  warn(message: string, context?: string, data?: Record<string, unknown>): void {
    if (!shouldLog('warn')) return;
    const entry = formatLogEntry('warn', message, context, data);
    console.warn(JSON.stringify(entry));
  },

  error(message: string, context?: string, data?: Record<string, unknown>): void {
    if (!shouldLog('error')) return;
    const entry = formatLogEntry('error', message, context, data);
    console.error(JSON.stringify(entry));
  },
};
