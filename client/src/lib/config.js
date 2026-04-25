// src/lib/config.js
// =============================================================================
// Central config — all environment variables are read here and exported.
// No other file should read import.meta.env directly; import from here instead.
// =============================================================================

export const config = {
  // Base URL for all API requests (used by src/api/client.js)
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',

  // App-level info
  appName: import.meta.env.VITE_APP_NAME || 'Open Data Platform',
  appUrl: import.meta.env.VITE_APP_URL || 'http://localhost:5173',
}
