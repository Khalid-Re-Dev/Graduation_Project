# Backend Configuration Guide

This document explains how the project has been configured to use the remote backend server.

## Current Configuration

The project is now configured to use the remote backend at:
**https://binc-b-1.onrender.com/api**

## Configuration Files

### 1. API Configuration (`src/config/api.config.js`)
- Main API configuration file
- Now uses environment-based configuration
- Automatically points to the remote backend

### 2. Environment Configuration (`src/config/environment.config.js`)
- Handles environment-specific settings
- Supports development, staging, and production environments
- Allows override via environment variables

### 3. Environment Variables (`.env.example`)
- Example configuration file
- Copy to `.env.local` for local overrides
- Key variables:
  - `VITE_APP_ENV`: Environment type (development/staging/production)
  - `VITE_API_BASE_URL`: Backend URL override

## Testing Connection

### Method 1: Connection Test Page
Visit `/connection-test` in your application to see a detailed connection status dashboard.

### Method 2: Browser Console
Open browser developer tools and check the console for API request logs.

### Method 3: Manual Testing
1. Start the frontend: `npm run dev` or `./run-project.bat`
2. Navigate to any page that loads data (e.g., products page)
3. Check if data loads successfully

## Environment Switching

### For Local Development (if needed)
Create a `.env.local` file:
```
VITE_APP_ENV=development
VITE_API_BASE_URL=http://127.0.0.1:8000/api
```

### For Production
The default configuration points to the remote backend.

### For Staging
Create a `.env.local` file:
```
VITE_APP_ENV=staging
VITE_API_BASE_URL=https://your-staging-backend.com/api
```

## Troubleshooting

### Common Issues

1. **CORS Errors**
   - Ensure the remote backend has CORS properly configured
   - Check that the frontend domain is allowed

2. **Network Errors**
   - Verify the backend URL is accessible
   - Check your internet connection
   - Ensure the backend server is running

3. **Authentication Issues**
   - Check if authentication endpoints are working
   - Verify token storage and retrieval

### Debug Steps

1. Visit `/connection-test` to see detailed connection status
2. Check browser console for error messages
3. Verify network requests in browser developer tools
4. Test API endpoints directly using tools like Postman

## File Changes Made

### Modified Files
- `src/config/api.config.js` - Updated to use remote backend
- `run-project.bat` - Updated startup message

### New Files
- `src/config/environment.config.js` - Environment configuration
- `src/utils/connectionTest.js` - Connection testing utilities
- `src/components/ConnectionTest.jsx` - Connection test UI component
- `.env.example` - Environment variables example
- `BACKEND_CONFIGURATION.md` - This documentation

### Unchanged Files
- All service files continue to work without changes
- All components and pages remain functional
- No breaking changes to existing functionality

## Next Steps

1. **Test the Application**: Start the frontend and verify all functionality works
2. **Backend Cleanup**: Decide whether to keep, move, or remove the local backend files
3. **Documentation**: Update main README.md with new setup instructions
4. **Deployment**: Configure production environment variables if needed

## Backend Directory

The local Django backend in the `backend/` directory is no longer needed for frontend operation. You can:

1. **Keep it**: For reference or future local development
2. **Archive it**: Move to a backup location
3. **Remove it**: Delete if no longer needed (recommended to backup first)

**Note**: Before removing the backend directory, ensure you have backups of any important data or configurations.
