// Temporarily hardcoded for production demo
const isProduction = typeof window !== 'undefined' && window.location.hostname === 'pathways.synapsesolves.com';
export const API_BASE_URL = isProduction 
  ? 'https://pathways-demo-backend.onrender.com/api'
  : (import.meta.env.VITE_API_URL || 'http://localhost:3001/api');

export const config = {
  apiUrl: API_BASE_URL,
  appEnv: import.meta.env.VITE_APP_ENV || 'development',
  appName: import.meta.env.VITE_APP_NAME || 'Pathways',
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
};

export default config;
