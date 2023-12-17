import winston from 'winston';
import config from '../config/config.js';
import path from 'path';

const { combine, timestamp, printf } = winston.format;

// Custom levels
const errorLevels = {
  fatal: 0,
  error: 1,
  warn: 2,
  info: 3,
  http: 4,
  debug: 5
};

// Improved log format with clearer timestamp
const logFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} [${level}]: ${message}`;
});

const logsFile = path.join(path.resolve(), 'logs', 'errors.log');
const transports = {
  development: [new winston.transports.Console()],
  testing: [new winston.transports.File({ filename: logsFile, level: 'error' })],
  production: [new winston.transports.File({ filename: logsFile, level: 'error' })],
  default: [new winston.transports.Console()]
};

const logger = winston.createLogger({
  levels: errorLevels,
  level: config.server.mode === 'production' ? 'info' : config.server.mode === 'testing' ? 'warn' : 'debug',
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    logFormat
  ),
  transports: transports[config.server.mode] || transports.default
});

export default logger;