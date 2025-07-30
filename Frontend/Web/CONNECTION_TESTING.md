# Backend Connection Testing Guide

The TaskForge web application includes built-in tools to test and monitor the connection between the frontend and backend services. This is especially useful during development to ensure both services are properly communicating.

## Features

### 1. Global Connection Status (Available on ALL Pages)
- **Location**: Floating widget in bottom-right corner
- **Functionality**: 
  - Collapsible panel showing connection status
  - Auto-refresh every 30 seconds
  - Quick connection test button
  - Detailed error information
- **Keyboard Shortcuts**: 
  - `F12` - Toggle connection panel
  - Click status icon for quick connection check
- **Visual Indicators**:
  - Browser tab title shows connection status (🟢🔴🔵)
  - Desktop notifications for connection changes (if permitted)

### 2. Real-time Connection Monitoring
- **Browser Tab**: Connection status emoji in page title
- **Notifications**: Desktop alerts when connection status changes
- **Console Logging**: Detailed connection logs in browser console
- **Auto-refresh**: Updates every 30 seconds automatically

### 3. Connection Test Dialog
- **Access**: Click "Run Full Test" in global status panel or Dev Tools page
- **Tests**:
  - Health Check (`/health`) - Basic server availability
  - Authentication (`/auth/check`) - Auth service status  
  - API Base (`/`) - Core API connectivity
- **Metrics**: Response times, error details, endpoint availability

### 4. Developer Tools Page
- **Access**: Side navigation → "Dev Tools" (development mode only)
- **Features**:
  - Live connection monitoring
  - Environment variables display
  - API endpoint listing
  - Debug utilities
  - Application state export

## Quick Access Methods

### Method 1: Global Floating Panel (Recommended)
1. Look for the connection status widget in bottom-right corner
2. Click to expand the panel
3. Use "Run Full Test" button for comprehensive testing
4. Available on ALL pages including login

### Method 2: Keyboard Shortcuts
- **F12**: Toggle connection status panel
- **Click status icon**: Quick connection refresh
- Works on any page in the application

### Method 3: Developer Tools Page
1. Navigate to "Dev Tools" in the sidebar
2. Use "Run Comprehensive Test" button
3. View detailed environment and configuration info

### Method 4: Browser Tab Monitoring
- Connection status automatically shown in browser tab title
- 🟢 = Connected, 🔴 = Disconnected, 🔵 = Checking
- No user action required

## Quick Setup

### 1. Configure Backend URL
Create a `.env` file in the project root:
```env
VITE_API_URL=http://localhost:5000/api
```

### 2. Start Backend Server
Ensure your TaskForge backend is running on the configured port (default: 5000)

### 3. Test Connection
1. Start the frontend: `npm run dev`
2. Connection status automatically appears in:
   - Bottom-right floating panel
   - Browser tab title
   - Desktop notifications (if enabled)
3. Click the floating panel for detailed testing

## Connection Indicators

### Status Colors
- 🟢 **Green**: Connected and healthy
- 🔴 **Red**: Disconnected or error
- 🔵 **Blue**: Checking connection
- ⚪ **Gray**: Status unknown

### Response Times
- **< 100ms**: Excellent
- **100-500ms**: Good  
- **500-1000ms**: Slow
- **> 1000ms**: Very slow

## Troubleshooting

### Common Issues

#### 1. CORS Errors
**Symptom**: Connection fails with CORS policy error
**Solution**: Ensure backend allows frontend origin in CORS settings

#### 2. Network Unreachable
**Symptom**: "Network Error" or timeout
**Solution**: 
- Check if backend server is running
- Verify correct port and URL in VITE_API_URL
- Check firewall settings

#### 3. 404 Not Found
**Symptom**: Endpoints return 404 errors
**Solution**:
- Verify API route configuration in backend
- Check if API base path is correct (usually `/api`)

#### 4. Authentication Issues
**Symptom**: 401 Unauthorized on protected endpoints
**Solution**:
- Check if JWT token is properly stored
- Verify token format and validity
- Ensure auth middleware is working

### Debug Steps

1. **Check Environment Variables**
   - Go to Dev Tools page
   - Verify VITE_API_URL is correct
   - Ensure MODE shows 'development'

2. **Test Individual Endpoints**
   - Use browser dev tools Network tab
   - Check actual HTTP requests being made
   - Verify request headers and payloads

3. **Backend Logs**
   - Check backend console for incoming requests
   - Look for CORS, authentication, or routing errors
   - Verify database connectivity

4. **Export Debug Info**
   - Use "Export App State" button in Dev Tools
   - Share with team for troubleshooting
   - Includes environment, localStorage, and config

## API Endpoints Tested

| Endpoint | Method | Purpose | Expected Response |
|----------|--------|---------|-------------------|
| `/health` | GET | Server health check | `{ status: "ok" }` |
| `/auth/check` | GET | Auth service status | Auth status or 401 |
| `/` | GET | API base connectivity | API info |
| `/auth/login` | POST | User authentication | JWT token |
| `/auth/me` | GET | Current user info | User object |

## Production Notes

- Connection testing tools are **development-only**
- Will not appear in production builds
- Use environment-specific API URLs
- Monitor connection status via application logs in production

## Security Considerations

- Never expose sensitive tokens in debug output
- Use HTTPS in production environments
- Implement proper CORS policies
- Rate limit connection test endpoints if needed

For more detailed backend setup instructions, refer to the Backend README.md file.
