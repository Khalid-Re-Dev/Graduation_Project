/**
 * Environment Configuration
 * This file handles environment-specific configurations
 */

// Environment types
export const ENVIRONMENTS = {
  DEVELOPMENT: 'development',
  PRODUCTION: 'production',
  STAGING: 'staging'
};

// Get current environment
export const getCurrentEnvironment = () => {
  // Check for environment variable first
  if (import.meta.env.VITE_APP_ENV) {
    return import.meta.env.VITE_APP_ENV;
  }
  
  // Check for NODE_ENV
  if (import.meta.env.NODE_ENV) {
    return import.meta.env.NODE_ENV;
  }
  
  // Default to production for safety
  return ENVIRONMENTS.PRODUCTION;
};

// Environment-specific configurations
const environmentConfigs = {
  [ENVIRONMENTS.DEVELOPMENT]: {
    API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api',
    DEBUG: true,
    LOG_LEVEL: 'debug'
  },
  [ENVIRONMENTS.STAGING]: {
    API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'https://binc-b-1.onrender.com/api',
    DEBUG: true,
    LOG_LEVEL: 'info'
  },
  [ENVIRONMENTS.PRODUCTION]: {
    API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'https://binc-b-1.onrender.com/api',
    DEBUG: false,
    LOG_LEVEL: 'error'
  }
};

// Get configuration for current environment
export const getEnvironmentConfig = () => {
  const currentEnv = getCurrentEnvironment();
  return environmentConfigs[currentEnv] || environmentConfigs[ENVIRONMENTS.PRODUCTION];
};

// Export specific config values
export const config = getEnvironmentConfig();
