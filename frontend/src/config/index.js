// Use environment variable in development, production URL in production build
export const API_BASE_URL = import.meta.env.DEV 
  ? 'http://localhost:3001/api'
  : 'https://pathways-demo-backend.onrender.com/api';

export const config = {
  apiUrl: API_BASE_URL,
  appEnv: import.meta.env.VITE_APP_ENV || 'production',
  appName: import.meta.env.VITE_APP_NAME || 'Pathways',
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
};

export default config;
