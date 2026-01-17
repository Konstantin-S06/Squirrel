/**
 * Centralized Port Configuration
 * 
 * This file centralizes all port configuration to avoid hardcoding
 * ports in multiple places. Update ports here for different environments.
 */

module.exports = {
  // Backend API server port
  BACKEND_PORT: process.env.PORT || process.env.BACKEND_PORT || 3001,
  
  // Frontend dev server port (for React Scripts)
  FRONTEND_PORT: process.env.REACT_APP_PORT || process.env.FRONTEND_PORT || 3000,
  
  // Backend URL (for frontend to connect to)
  BACKEND_URL: process.env.REACT_APP_PROXY_URL || 
               process.env.BACKEND_URL || 
               `http://localhost:${process.env.PORT || process.env.BACKEND_PORT || 3001}`,
};
