export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export const config = {
  apiUrl: API_BASE_URL,
  appEnv: import.meta.env.VITE_APP_ENV || 'development',
  appName: import.meta.env.VITE_APP_NAME || 'Pathways',
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
};

export default config;
