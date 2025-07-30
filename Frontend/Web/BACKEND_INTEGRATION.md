# TaskForge Backend Integration Guide

This guide explains how to set up and maintain the connection between the TaskForge frontend and backend.

## 🏗️ Project Structure

The TaskForge project is organized as a monorepo with the following structure:

```
TaskForge/
├── Backend/                 # Node.js/Express backend
│   ├── src/
│   │   ├── server.js       # Main server file
│   │   ├── routes/         # API routes
│   │   ├── models/         # Data models
│   │   └── services/       # Business logic
│   ├── prisma/             # Database schema & migrations
│   └── package.json
├── Frontend/
│   ├── Web/                # React web application
│   │   ├── src/
│   │   ├── public/
│   │   └── package.json
│   └── App/                # Flutter mobile app
└── TaskForge.code-workspace # VS Code workspace configuration
```

## 🚀 Quick Start

### Option 1: Using the Development Manager (Recommended)

1. **Complete Setup**:
   ```bash
   cd Frontend/Web
   npm run dev:setup
   ```

2. **Start Development Servers**:
   ```bash
   npm run dev:start
   ```

### Option 2: Manual Setup

1. **Install Dependencies**:
   ```bash
   # Backend
   cd Backend
   npm install
   
   # Frontend
   cd ../Frontend/Web
   npm install
   ```

2. **Configure Environment**:
   ```bash
   # Create .env file in Frontend/Web
   VITE_API_URL=http://localhost:4000/api
   VITE_GRAPHQL_URL=http://localhost:4000/graphql
   VITE_NODE_ENV=development
   ```

3. **Start Servers**:
   ```bash
   # Terminal 1 - Backend
   cd Backend
   npm start
   
   # Terminal 2 - Frontend
   cd Frontend/Web
   npm run dev
   ```

## 🔧 Development Tools

### Connection Testing

Test backend connectivity at any time:

```bash
# Quick connection test
npm run test:connection

# Comprehensive backend test
npm run backend:test

# Check project setup
npm run dev:check
```

### VS Code Integration

Open the workspace file for optimal development experience:
```bash
code TaskForge.code-workspace
```

This provides:
- ✅ Multi-root workspace with Frontend/Backend/Mobile
- ✅ Integrated terminal configurations
- ✅ Debugging configurations for full-stack development
- ✅ Recommended extensions
- ✅ Task automation (Ctrl+Shift+P → "Tasks: Run Task")

## 🌐 API Configuration

### Environment Variables

The frontend uses the following environment variables:

| Variable | Description | Default |
| --- | --- | --- |
| `VITE_API_URL` | Backend API base URL | `http://localhost:4000/api` |
| `VITE_GRAPHQL_URL` | GraphQL endpoint URL | `http://localhost:4000/graphql` |
| `VITE_NODE_ENV` | Environment mode | `development` |
| `VITE_CONNECTION_TEST_INTERVAL` | Auto-test interval (ms) | `30000` |
| `VITE_CONNECTION_RETRY_ATTEMPTS` | Connection retry attempts | `3` |

### Backend Endpoints

The backend provides the following key endpoints:

| Endpoint | Method | Description |
| --- | --- | --- |
| `/health` | GET | Simple server health check |
| `/api/health` | GET | Detailed server information |
| `/api/auth/login` | POST | User authentication |
| `/api/auth/register` | POST | User registration |
| `/api/auth/profile` | GET | User profile (protected) |
| `/api/tasks` | GET/POST | Task management |
| `/api/projects` | GET/POST | Project management |
| `/api/reports` | GET | Report generation |
| `/graphql` | POST | GraphQL endpoint |

## 🔍 Connection Monitoring

### Global Connection Status

The frontend includes a global connection monitoring system:

- **Floating Panel**: Always visible connection status (F12 to toggle)
- **Auto-Testing**: Periodic backend connectivity checks
- **Notifications**: Desktop notifications for connection changes
- **Tab Indicators**: Browser tab title shows connection status

### Connection Test Details

The connection test performs three checks:

1. **Health Check** (`/health` or `/api/health`)
   - Tests basic server connectivity
   - Measures response time
   - Retrieves server information

2. **Authentication** (`/api/auth/login`)
   - Tests auth endpoint availability
   - Uses OPTIONS/GET to avoid auth requirements
   - Handles method-not-allowed responses

3. **API Base** (`/api/health`)
   - Tests main API functionality
   - Verifies API routing
   - Extracts version information

## 🛠️ Development Workflow

### Typical Development Session

1. **Start the session**:
   ```bash
   npm run dev:check    # Verify setup
   npm run dev:start    # Start both servers
   ```

2. **Monitor connection**:
   - Watch the floating connection panel
   - Press F12 to toggle detailed view
   - Check console for connection logs

3. **Test API changes**:
   ```bash
   npm run test:connection  # Quick API test
   ```

### Debugging Connection Issues

1. **Check server status**:
   ```bash
   npm run dev:check
   ```

2. **Test individual components**:
   ```bash
   # Test backend only
   cd Backend && npm start
   
   # Test frontend only
   cd Frontend/Web && npm run dev
   ```

3. **Verify network configuration**:
   - Check `.env` file in `Frontend/Web`
   - Ensure backend is running on expected port
   - Test direct browser access to backend endpoints

## 📋 Available NPM Scripts

### Frontend (Web)

| Script | Description |
| --- | --- |
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
| `npm run test:connection` | Test backend connection |
| `npm run dev:setup` | Complete development setup |
| `npm run dev:check` | Check project configuration |
| `npm run dev:install` | Install dependencies |
| `npm run dev:start` | Start full-stack development |
| `npm run backend:test` | Comprehensive backend test |

### Backend

| Script | Description |
| --- | --- |
| `npm start` | Start production server |
| `npm run dev` | Start development server with nodemon |
| `npm test` | Run tests |

## 🚨 Troubleshooting

### Common Issues

1. **"Connection failed" errors**:
   - Ensure backend server is running
   - Check `.env` configuration
   - Verify network connectivity
   - Try accessing backend endpoints directly in browser

2. **"Auth endpoints unavailable"**:
   - This is expected if backend requires authentication
   - Check if `/api/auth/login` returns 405 Method Not Allowed
   - Verify auth routes are properly configured

3. **"CORS errors"**:
   - Ensure backend CORS is configured for frontend URL
   - Check if backend allows the frontend origin

4. **Port conflicts**:
   - Backend typically runs on port 4000
   - Frontend typically runs on port 5173
   - Change ports in respective configurations if needed

### Getting Help

1. **Check connection status**: Use the global connection panel (F12)
2. **Run diagnostics**: `npm run dev:check`
3. **View logs**: Check browser console and terminal output
4. **Test endpoints**: Use the connection test scripts

## 🎯 Best Practices

1. **Always run `dev:check` before starting development**
2. **Keep the connection panel visible during development**
3. **Test connection after making backend changes**
4. **Use the workspace file for consistent VS Code setup**
5. **Monitor both frontend and backend logs simultaneously**

## 🔄 Continuous Integration

For production deployments:

1. **Environment Variables**: Set production API URLs
2. **Build Process**: `npm run build` creates optimized frontend
3. **Health Checks**: Use `/health` endpoint for load balancer checks
4. **Monitoring**: Connection panel works in production for debugging

---

Happy coding with TaskForge! 🚀
