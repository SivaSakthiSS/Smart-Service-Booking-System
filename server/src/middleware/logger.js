import morgan from 'morgan';
import { config } from '../config/environment.js';

// Development: concise colored output; Production: Apache combined standard format
export const requestLogger = config.isDevelopment
  ? morgan('dev')
  : morgan('combined');
