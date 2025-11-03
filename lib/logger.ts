type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, any>;
  userId?: string;
  ip?: string;
  path?: string;
  method?: string;
}

class Logger {
  private formatLog(entry: LogEntry): string {
    const { timestamp, level, message, context, userId, ip, path, method } = entry;
    
    const logData: any = {
      timestamp,
      level,
      message,
    };

    if (context) logData.context = context;
    if (userId) logData.userId = userId;
    if (ip) logData.ip = ip;
    if (path) logData.path = path;
    if (method) logData.method = method;

    return JSON.stringify(logData);
  }

  private log(level: LogLevel, message: string, context?: Record<string, any>) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
    };

    const formattedLog = this.formatLog(entry);

    switch (level) {
      case 'error':
        console.error(formattedLog);
        break;
      case 'warn':
        console.warn(formattedLog);
        break;
      case 'debug':
        if (process.env.NODE_ENV === 'development') {
          console.debug(formattedLog);
        }
        break;
      default:
        console.log(formattedLog);
    }
  }

  info(message: string, context?: Record<string, any>) {
    this.log('info', message, context);
  }

  warn(message: string, context?: Record<string, any>) {
    this.log('warn', message, context);
  }

  error(message: string, context?: Record<string, any>) {
    this.log('error', message, context);
  }

  debug(message: string, context?: Record<string, any>) {
    this.log('debug', message, context);
  }

  // Request logging helper
  request(method: string, path: string, ip?: string, userId?: string, context?: Record<string, any>) {
    this.info('Request received', {
      method,
      path,
      ip,
      userId,
      ...context,
    });
  }

  // Security event logging
  security(event: string, context?: Record<string, any>) {
    this.warn(`Security event: ${event}`, context);
  }
}

export const logger = new Logger();

