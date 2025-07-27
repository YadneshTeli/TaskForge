# 🔧 TaskForge Database Troubleshooting Guide

This guide helps resolve common database setup issues that contributors might encounter.

## 🚨 Quick Diagnostics

Run this command first to identify issues:
```bash
npm run db:test
```

## 🐘 PostgreSQL Issues

### Error: "Connection refused" or "ECONNREFUSED"

**Cause**: PostgreSQL server is not running or not accessible.

**Solutions**:
```bash
# Windows - Check if PostgreSQL service is running
Get-Service postgresql*

# Start PostgreSQL service if stopped
Start-Service postgresql-x64-*

# Check if PostgreSQL is listening on port 5432
netstat -an | findstr 5432
```

### Error: "password authentication failed"

**Cause**: Incorrect password in DATABASE_URL.

**Solutions**:
1. Reset PostgreSQL password:
```sql
-- Connect as superuser and reset password
ALTER USER postgres PASSWORD 'new_password';
```

2. Update your `.env` file:
```env
DATABASE_URL="postgresql://postgres:new_password@localhost:5432/TaskForge"
```

### Error: "database does not exist"

**Cause**: TaskForge database not created.

**Solutions**:
```bash
# Connect to PostgreSQL and create database
psql -U postgres
CREATE DATABASE "TaskForge";
\q
```

### Error: "Prisma migrate failed"

**Cause**: Migration conflicts or database state issues.

**Solutions**:
```bash
# Reset Prisma migrations (⚠️ Deletes all data)
npx prisma migrate reset --force

# Or manually reset
npx prisma db push --force-reset
```

## 🍃 MongoDB Issues

### Error: "MongoServerError: connection refused"

**Cause**: MongoDB server is not running.

**Solutions**:
```bash
# Windows - Start MongoDB service
net start MongoDB

# Check MongoDB status
mongosh --eval "db.runCommand({ ping: 1 })"
```

### Error: "MongooseServerSelectionError"

**Cause**: MongoDB connection string incorrect or server not accessible.

**Solutions**:
1. Check MongoDB is running on correct port:
```bash
netstat -an | findstr 27017
```

2. Test connection manually:
```bash
mongosh "mongodb://localhost:27017/TaskForge"
```

3. Verify MONGO_URI in `.env`:
```env
MONGO_URI="mongodb://localhost:27017/TaskForge"
```

### Error: "Authentication failed" (MongoDB Atlas)

**Cause**: Incorrect credentials or IP not whitelisted.

**Solutions**:
1. Check your Atlas connection string format:
```env
MONGO_URI="mongodb+srv://username:password@cluster.net/TaskForge?retryWrites=true&w=majority"
```

2. Verify IP whitelist in Atlas dashboard (use 0.0.0.0/0 for development)

## 🐳 Docker Issues

### Error: "docker command not found"

**Cause**: Docker not installed or not in PATH.

**Solutions**:
1. Install Docker Desktop: https://www.docker.com/products/docker-desktop
2. Restart terminal after installation
3. Verify: `docker --version`

### Error: "Cannot connect to Docker daemon"

**Cause**: Docker Desktop not running.

**Solutions**:
1. Start Docker Desktop application
2. Wait for Docker to fully start (check system tray icon)
3. Verify: `docker ps`

### Error: "Port already in use"

**Cause**: Another service using database ports.

**Solutions**:
```bash
# Check what's using port 5432 (PostgreSQL)
netstat -ano | findstr 5432

# Check what's using port 27017 (MongoDB)
netstat -ano | findstr 27017

# Stop conflicting services or change Docker ports
docker-compose down
```

### Error: "Container exits immediately"

**Cause**: Container configuration issues or insufficient resources.

**Solutions**:
```bash
# Check container logs
docker-compose logs postgres
docker-compose logs mongodb

# Restart with fresh volumes
docker-compose down -v
docker-compose up -d
```

## ⚡ Environment Issues

### Error: "JWT_SECRET not found"

**Cause**: Missing or invalid environment variables.

**Solutions**:
```bash
# Regenerate environment file
npm run setup:env

# Or manually add to .env
JWT_SECRET=your_64_character_random_string_here
```

### Error: "dotenv variables not loading"

**Cause**: .env file not in correct location or format issues.

**Solutions**:
1. Ensure `.env` is in Backend root directory
2. Check file format (no spaces around =)
3. Restart your application after .env changes

## 🔧 Node.js & NPM Issues

### Error: "MODULE_NOT_FOUND"

**Cause**: Dependencies not installed or corrupted.

**Solutions**:
```bash
# Clear and reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Or use npm cache clean
npm cache clean --force
npm install
```

### Error: "Prisma Client not generated"

**Cause**: Prisma client needs regeneration after schema changes.

**Solutions**:
```bash
# Regenerate Prisma client
npx prisma generate

# If still failing, try
rm -rf node_modules/.prisma
npx prisma generate
```

## 🧪 Testing Issues

### Error: "Connection timeout"

**Cause**: Database taking too long to respond.

**Solutions**:
1. Increase timeout in test script
2. Check database performance
3. Restart database services

### Error: "Tests failing randomly"

**Cause**: Race conditions or shared test data.

**Solutions**:
1. Run tests with isolated databases
2. Clear test data between runs
3. Use proper async/await patterns

## 🚀 Performance Issues

### Slow Database Operations

**Causes & Solutions**:

1. **Missing Indexes**:
```javascript
// Add indexes to frequently queried fields
db.tasks.createIndex({ "projectId": 1 })
db.tasks.createIndex({ "assignedTo": 1 })
```

2. **Too much data**:
```bash
# Reset with minimal seed data  
npm run db:reset
npm run db:init  # Only creates admin user
```

3. **Connection pooling**:
```javascript
// Optimize Prisma connection pool
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  connectionLimit = 5
}
```

## 📱 Platform-Specific Issues

### Windows Issues

1. **PowerShell Execution Policy**:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

2. **Path separators in commands**:
Use forward slashes or escape backslashes in scripts.

3. **Windows Defender blocking**:
Add project folder to Windows Defender exclusions.

### macOS Issues

1. **Permission denied**:
```bash
sudo chown -R $(whoami) node_modules
```

2. **Homebrew PostgreSQL**:
```bash
brew services start postgresql
```

### Linux Issues

1. **Service management**:
```bash
sudo systemctl start postgresql
sudo systemctl start mongod
```

2. **User permissions**:
```bash
sudo -u postgres createdb TaskForge
```

## 🆘 Emergency Reset

If everything is broken and you need to start fresh:

```bash
# 1. Stop all services
docker-compose down -v
net stop PostgreSQL
net stop MongoDB

# 2. Clear all data
rm -rf node_modules
rm package-lock.json
rm .env

# 3. Fresh start
npm install
npm run setup:env
npm run setup:docker  # or setup:local
npm run db:init
npm run db:seed
```

## 🎯 Getting Help

### Before Asking for Help

1. ✅ Run `npm run db:test` and share output
2. ✅ Check your `.env` file configuration
3. ✅ Try the emergency reset procedure
4. ✅ Check the logs: `docker-compose logs` or application logs

### Where to Get Help

1. **GitHub Issues**: Create issue with error details
2. **Documentation**: Check `CONTRIBUTOR_SETUP.md`
3. **Discord/Slack**: Project communication channels
4. **Stack Overflow**: Tag with `taskforge`, `prisma`, `mongodb`

### Information to Include

When reporting issues, include:
- Operating System and version
- Node.js version (`node --version`)
- Error messages (full stack trace)
- Steps to reproduce
- Your `.env` file (without sensitive data)
- Output of `npm run db:test`

## ✅ Prevention Tips

1. **Always backup**: Before major changes, backup your data
2. **Version control**: Keep your `.env.example` updated
3. **Documentation**: Update setup docs when you discover new issues
4. **Testing**: Test setup scripts on fresh environment
5. **Dependencies**: Keep dependencies updated regularly

## 🎉 Success Indicators

Your setup is working correctly when:
- ✅ `npm run db:test` shows all connections successful
- ✅ `npm run dev` starts server without errors
- ✅ You can login with admin@taskforge.com / admin123
- ✅ Database admin tools are accessible
- ✅ Sample data is visible in the database

Happy troubleshooting! 🚀
