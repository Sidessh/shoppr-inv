import pino from 'pino';

// Create logger instance
const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: process.env.NODE_ENV === 'development' 
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname',
        },
      }
    : undefined,
  base: {
    env: process.env.NODE_ENV,
    pid: process.pid,
  },
  timestamp: pino.stdTimeFunctions.isoTime,
});

// Custom log levels
export const logLevels = {
  fatal: 60,
  error: 50,
  warn: 40,
  info: 30,
  debug: 20,
  trace: 10,
};

// Helper functions for common logging patterns
export const logRequest = (req: any, res: any, responseTime: number) => {
  logger.info({
    type: 'request',
    method: req.method,
    url: req.url,
    statusCode: res.statusCode,
    responseTime,
    userAgent: req.get('User-Agent'),
    ip: req.ip,
    userId: req.user?.id,
  });
};

export const logError = (error: Error, context?: any) => {
  logger.error({
    type: 'error',
    message: error.message,
    stack: error.stack,
    context,
  });
};

export const logAuth = (action: string, userId?: string, details?: any) => {
  logger.info({
    type: 'auth',
    action,
    userId,
    details,
  });
};

export const logSecurity = (event: string, details?: any) => {
  logger.warn({
    type: 'security',
    event,
    details,
  });
};

export default logger;
