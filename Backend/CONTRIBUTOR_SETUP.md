# 🚀 TaskForge Database Setup for Contributors

Welcome to TaskForge! This guide will help you set up your local development environment quickly and easily.

## 📋 Quick Start

For first-time setup, run this single command:
```bash
npm run contributor-setup
```

This interactive script will guide you through the entire setup process.

## 🛠️ Manual Setup Options

### Option 1: Automated Setup (Recommended)
```bash
# 1. Install dependencies
npm install

# 2. Run the contributor setup wizard
npm run contributor-setup
```

### Option 2: Step-by-Step Setup
```bash
# 1. Install dependencies
npm install

# 2. Setup environment
npm run setup:env

# 3. Setup databases (choose one)
npm run setup:docker     # Docker setup (easiest)
npm run setup:local      # Local installation setup
npm run setup:cloud      # Cloud databases setup

# 4. Initialize database schema
npm run db:init

# 5. Seed with sample data
npm run db:seed

# 6. Test everything
npm run db:test
```

## 🗄️ Database Architecture

TaskForge uses a **hybrid database approach**:

- **PostgreSQL** (via Prisma) - User management, analytics, metrics
- **MongoDB** (via Mongoose) - Tasks, projects, comments, real-time data

## 🐳 Docker Setup (Recommended)

The easiest way to get started:

```bash
# Start databases with Docker
npm run docker:up

# Wait 30 seconds for databases to initialize
# Then run setup
npm run db:init
npm run db:seed
```

Database admin tools will be available at:
- **pgAdmin**: http://localhost:8080 (admin@taskforge.com / admin123)
- **Mongo Express**: http://localhost:8081 (admin / admin123)

## 💻 Local Installation Setup

### PostgreSQL
1. Download from: https://www.postgresql.org/download/
2. Install with default settings
3. Remember the password for `postgres` user
4. Create database: `CREATE DATABASE TaskForge;`

### MongoDB
1. Download from: https://www.mongodb.com/try/download/community
2. Install MongoDB Community Server
3. Start MongoDB service
4. Database will be created automatically

## ☁️ Cloud Setup

### MongoDB Atlas (Free)
1. Sign up at: https://www.mongodb.com/cloud/atlas
2. Create free M0 cluster
3. Create database user
4. Whitelist your IP (0.0.0.0/0 for development)
5. Get connection string

### PostgreSQL Cloud Options
- **Supabase**: https://supabase.com/ (Free tier: 500MB)
- **Railway**: https://railway.app/ (Free tier: $5 credit)
- **ElephantSQL**: https://www.elephantsql.com/ (Free tier: 20MB)

## 🔧 Environment Configuration

Your `.env` file should contain:

```env
# Server Configuration
NODE_ENV=development
PORT=4000

# JWT Configuration (auto-generated)
JWT_SECRET=your_secure_jwt_secret_here
JWT_EXPIRE=7d

# PostgreSQL (Analytics & User Management)
DATABASE_URL="postgresql://postgres:admin@localhost:5432/TaskForge"

# MongoDB (Tasks & Projects)
MONGO_URI="mongodb://localhost:27017/TaskForge"

# Optional: Cloudinary (for file uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## 📊 Available NPM Scripts

### Setup & Initialization
- `npm run contributor-setup` - Interactive setup wizard for new contributors
- `npm run setup:env` - Create/update environment file
- `npm run setup:docker` - Setup using Docker containers
- `npm run setup:local` - Setup using local database installations
- `npm run setup:cloud` - Setup using cloud database services

### Database Management
- `npm run db:init` - Initialize database schema and create admin user
- `npm run db:seed` - Populate databases with comprehensive sample data
- `npm run db:reset` - Reset databases (⚠️ Deletes all data)
- `npm run db:migrate` - Run Prisma migrations
- `npm run db:test` - Test database connections
- `npm run db:studio` - Open Prisma Studio (database GUI)

### Docker Commands
- `npm run docker:up` - Start database containers
- `npm run docker:down` - Stop database containers
- `npm run docker:logs` - View container logs
- `npm run docker:reset` - Reset Docker volumes

### Development
- `npm run dev` - Start development server
- `npm run start` - Start production server
- `npm run test` - Run tests

## 🎯 What Gets Created

After running the setup, you'll have:

### Sample Users (PostgreSQL)
- **Admin**: admin@taskforge.com / admin123
- **Users**: john@taskforge.com, jane@taskforge.com, mike@taskforge.com / user123
- **Test**: test@taskforge.com / test123

### Sample Projects (PostgreSQL)
- TaskForge Development
- Marketing Campaign Q4
- API Documentation
- Mobile App Beta

### Sample Tasks (MongoDB)
- 10+ realistic development tasks
- Various priorities and statuses
- Comments and attachments
- Due dates and assignments

### Analytics Data (PostgreSQL)
- User statistics and metrics
- Project analytics and performance
- Task completion metrics
- Activity logs and audit trail

## 🧪 Testing Your Setup

```bash
# Test database connections
npm run db:test

# Start the server
npm run dev

# Visit http://localhost:4000 to see API status
# Visit http://localhost:8080 for pgAdmin (if using Docker)
# Visit http://localhost:8081 for Mongo Express (if using Docker)
```

## 🔍 Troubleshooting

### Common Issues

**1. "Connection refused" errors**
- Ensure PostgreSQL/MongoDB services are running
- Check your connection strings in `.env`
- For Docker: run `docker-compose ps` to check container status

**2. "Permission denied" errors**
- Check database user permissions
- Ensure database exists and user has access
- Try connecting manually with database client

**3. "Module not found" errors**
- Run `npm install` to ensure all dependencies are installed
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`

**4. Migration errors**
- Reset database: `npm run db:reset`
- Run migrations manually: `npx prisma migrate reset --force`

### Getting Help

1. Check the troubleshooting section above
2. Review your `.env` file configuration
3. Test connections: `npm run db:test`
4. Check Docker logs: `npm run docker:logs`
5. Open an issue on GitHub with error details

## 🚀 Ready to Develop!

Once setup is complete:

1. **Start coding**: Your databases are populated with realistic sample data
2. **API Testing**: Use tools like Postman or Thunder Client
3. **Database GUI**: Use pgAdmin and Mongo Express for data inspection
4. **Development**: Hot reload with `npm run dev`

## 📝 Contributing Guidelines

Before making database changes:

1. **Schema Changes**: Update `prisma/schema.prisma` and run migrations
2. **Seed Data**: Update seed scripts to include your test data needs
3. **Documentation**: Update this README with any new setup requirements
4. **Testing**: Ensure `npm run db:test` passes after changes

## 🎉 Welcome to TaskForge Development!

You're all set! Your development environment is ready with:
- ✅ Databases configured and populated
- ✅ Sample data for realistic testing
- ✅ Admin tools for database management
- ✅ Development server ready to run

Happy coding! 🚀
