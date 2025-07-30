# TaskForge Web Application

A modern, responsive web application for task and project management built with React, Tailwind CSS, and shadcn/ui components.

## 📋 Quick Start

### Option 1: Automated Setup (Recommended)
```bash
npm run dev:setup    # Complete setup and configuration
npm run dev:start    # Start full-stack development
```

### Option 2: Manual Setup
```bash
npm install          # Install dependencies
npm run dev:check    # Verify configuration
npm run dev          # Start development server
```

📖 **For detailed backend integration and setup instructions, see [BACKEND_INTEGRATION.md](./BACKEND_INTEGRATION.md)**

## Features

- 🚀 **Modern UI**: Built with React and Tailwind CSS
- 🎨 **Beautiful Components**: Using shadcn/ui component library
- 📱 **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- 🔐 **Authentication**: Secure login and registration system
- 📊 **Dashboard**: Comprehensive overview with key metrics
- 📋 **Task Management**: Create, update, and track tasks
- 🗂️ **Project Management**: Organize work into projects
- 📈 **Reports & Analytics**: Detailed insights and performance metrics
- 👤 **User Profiles**: Customizable user profiles and preferences
- 🔗 **Backend Integration**: Real-time connection monitoring and testing
- 🔍 **Developer Tools**: Built-in connection testing and debugging

## Technology Stack

- **React 19** - Modern React with latest features
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - High-quality React components
- **React Router** - Client-side routing
- **React Query** - Server state management
- **Axios** - HTTP client for API calls
- **Zustand** - Lightweight state management
- **Lucide React** - Beautiful icons
- **Vite** - Fast build tool and dev server

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or yarn package manager
- TaskForge Backend running (see Backend directory)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd TaskForge/Frontend/Web
```

2. **Automated Setup** (Recommended):
```bash
npm install
npm run dev:setup
```

3. **Manual Setup**:
```bash
npm install
```

4. Set up environment variables:
```bash
# Copy example environment file (if it exists)
cp .env.example .env
# OR create .env manually with:
VITE_API_URL=http://localhost:4000/api
VITE_GRAPHQL_URL=http://localhost:4000/graphql
VITE_NODE_ENV=development
```

5. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`.

### Backend Connection Testing

Test your backend connection anytime:
```bash
npm run test:connection     # Quick connection test
npm run backend:test        # Comprehensive test
npm run dev:check          # Check full project setup
```

### Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui components
│   ├── layout/         # Layout components
│   └── GlobalConnectionStatus.jsx  # Connection monitoring
├── pages/              # Page components
├── contexts/           # React contexts
├── hooks/              # Custom React hooks
├── services/           # API services and connection testing
├── lib/                # Utility functions and API client
├── App.jsx             # Main app component
└── main.jsx            # Application entry point
```

## Available Scripts

### Development
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Backend Integration
- `npm run test:connection` - Test backend connection
- `npm run dev:setup` - Complete development setup
- `npm run dev:check` - Check project configuration
- `npm run dev:install` - Install dependencies
- `npm run dev:start` - Start full-stack development
- `npm run backend:test` - Comprehensive backend test

## Backend Integration

The application includes comprehensive backend integration features:

### Connection Monitoring
- **Real-time Status**: Global connection status panel (press F12)
- **Auto-testing**: Periodic backend connectivity checks
- **Notifications**: Desktop notifications for connection changes
- **Health Checks**: Multiple endpoint testing (health, auth, API base)

### API Integration
The application integrates with the TaskForge backend API for:
- User authentication (login/register)
- Task CRUD operations
- Project management
- User profiles
- Reports and analytics
- Real-time GraphQL subscriptions

API configuration is handled in `src/lib/api.js`.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

This project is licensed under the MIT License.+ Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
