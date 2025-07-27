# TaskForge Hybrid Architecture

## Overview

TaskForge now implements a hybrid architecture that combines the best of both MongoDB and PostgreSQL through Prisma, providing operational flexibility and powerful analytics capabilities.

## Architecture Components

### 🍃 MongoDB (via Mongoose)
**Purpose**: Core business operations and real-time data
- **Projects**: Project management with members, tasks, and metadata
- **Tasks**: Task operations with comments and assignments
- **Users**: User management and authentication
- **Comments**: Task and project discussions
- **Notifications**: Real-time user notifications

### 🐘 PostgreSQL (via Prisma)
**Purpose**: Analytics, reporting, and metrics
- **TaskMetrics**: Detailed task performance and time tracking
- **ProjectAnalytics**: Project completion rates and productivity scores
- **UserStats**: User productivity and engagement metrics
- **Logs**: Audit trails and system events

### 🎯 API Layer

#### REST API (`/api/*`)
- Simple CRUD operations
- File uploads
- Authentication endpoints
- Direct database operations

#### GraphQL API (`/graphql`)
- Complex queries with relationships
- Real-time subscriptions (planned)
- Analytics and reporting queries
- Efficient data fetching with resolvers

## Data Flow

```
┌─────────────┐    ┌──────────────┐    ┌─────────────┐
│   Client    │───▶│   API Layer  │───▶│  Services   │
│             │    │ (REST/GraphQL)│    │   Layer     │
└─────────────┘    └──────────────┘    └─────────────┘
                                              │
                            ┌─────────────────┼─────────────────┐
                            ▼                 ▼                 ▼
                    ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
                    │   MongoDB    │  │ PostgreSQL   │  │ Sync Service │
                    │ (Operations) │  │ (Analytics)  │  │              │
                    └──────────────┘  └──────────────┘  └──────────────┘
```

## Key Features

### ✨ Hybrid Data Management
- **Operational Data**: Stored in MongoDB for flexibility and performance
- **Analytics Data**: Automatically synced to PostgreSQL for complex reporting
- **Real-time Sync**: Changes in MongoDB trigger updates in PostgreSQL analytics

### 📊 Advanced Analytics
- Task completion metrics and time tracking
- Project productivity scores and completion rates
- User engagement and performance statistics
- Historical data analysis and trends

### 🚀 Performance Benefits
- **MongoDB**: Fast document operations and flexible schema
- **PostgreSQL**: Complex analytical queries and data integrity
- **Service Layer**: Clean separation of concerns and maintainable code

## Services Architecture

### Core Services

#### `taskService`
```javascript
// MongoDB operations
await taskService.createTask(taskData)
await taskService.getTasksByProject(projectId)
await taskService.updateTask(taskId, updateData)

// Prisma analytics
await taskService.getTaskAnalytics(projectId)
await taskService.getUserTaskStats(userId)
```

#### `projectService`
```javascript
// MongoDB operations  
await projectService.createProject(projectData)
await projectService.getUserProjects(userId)

// Prisma analytics
await projectService.getProjectAnalytics(projectId)
await projectService.getProjectDashboardData(projectId)
```

#### `syncService`
```javascript
// Synchronization
await syncService.syncTaskToPrisma(task)
await syncService.updateProjectAnalytics(projectId)
await syncService.fullSync() // Initial setup
```

## API Examples

### REST API

#### Create a Task
```http
POST /api/tasks
Content-Type: application/json
Authorization: Bearer <token>

{
  "title": "Complete user authentication",
  "description": "Implement JWT-based auth system",
  "projectId": "60f7b3b3b3b3b3b3b3b3b3b3",
  "assignedTo": "60f7b3b3b3b3b3b3b3b3b3b4",
  "dueDate": "2024-02-01T00:00:00.000Z",
  "priority": "high"
}
```

#### Get Project Analytics
```http
GET /api/project/60f7b3b3b3b3b3b3b3b3b3b3/analytics
Authorization: Bearer <token>
```

### GraphQL API

#### Query with Analytics
```graphql
query GetProjectWithAnalytics($projectId: ID!) {
  getProject(projectId: $projectId) {
    id
    name
    description
    owner {
      username
      email
    }
    members {
      username
      email
    }
    tasks {
      id
      title
      status
      assignedTo {
        username
      }
    }
    analytics {
      totalTasks
      completedTasks
      completionRate
      productivityScore
    }
  }
}
```

#### Get User Statistics
```graphql
query GetUserStats($userId: ID) {
  getUserStats(userId: $userId) {
    totalTasksCompleted
    totalTasksPending
    totalTasksOverdue
    avgTaskCompletionTime
    totalProjectsOwned
    lastActivityAt
  }
}
```

## Setup Instructions

### 1. Install Dependencies
```bash
cd Backend
npm install
```

### 2. Environment Configuration
Create a `.env` file:
```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/taskforge

# PostgreSQL
DATABASE_URL=postgresql://username:password@localhost:5432/taskforge_analytics

# JWT
JWT_SECRET=your-secret-key

# Other config...
```

### 3. Database Setup
```bash
# Run Prisma migrations
npx prisma migrate dev

# Generate Prisma client
npx prisma generate
```

### 4. Initialize Hybrid Architecture
```bash
node scripts/init-hybrid-architecture.js
```

### 5. Start the Server
```bash
npm start
```

## Development Workflow

### Adding New Features

1. **Create MongoDB Models** for operational data
2. **Add Prisma Models** for analytics (if needed)
3. **Implement Service Layer** with both data sources
4. **Update GraphQL Schema** for new queries/mutations
5. **Create Resolvers** using service layer
6. **Add REST Routes** for simple operations
7. **Test Both APIs** thoroughly

### Data Synchronization

The hybrid architecture automatically keeps analytics data in sync:

- **Task Operations**: MongoDB → Prisma sync via `taskService`
- **Project Changes**: Automatic analytics updates
- **User Activities**: Real-time stats updates

### Monitoring and Maintenance

- Use `syncService.fullSync()` for data recovery
- Monitor both databases for performance
- Regular cleanup with `syncService.cleanupOrphanedData()`

## Best Practices

### 🎯 When to Use MongoDB
- Real-time operations (CRUD)
- Flexible document structures
- High-frequency updates
- User sessions and auth

### 🎯 When to Use PostgreSQL/Prisma
- Complex analytical queries
- Historical data analysis
- Reporting and dashboards
- Data integrity requirements

### 🎯 Service Layer Guidelines
- Always use services in routes/resolvers
- Handle both databases in service methods
- Implement proper error handling
- Maintain transaction consistency where needed

## Troubleshooting

### Common Issues

1. **Sync Failures**: Check MongoDB connection and Prisma schema
2. **Performance Issues**: Monitor query patterns and indexing
3. **Data Inconsistency**: Run full sync to recover

### Debugging

```bash
# Check Prisma connection
npx prisma db seed

# Verify MongoDB connection
node -e "require('./src/config/db')"

# Run sync diagnostics
node scripts/init-hybrid-architecture.js
```

## Future Enhancements

- [ ] Real-time GraphQL subscriptions
- [ ] Advanced caching strategies
- [ ] Machine learning analytics
- [ ] Multi-tenant support
- [ ] API rate limiting and throttling
- [ ] Advanced monitoring and alerting

---

This hybrid architecture provides the foundation for a scalable, maintainable, and feature-rich task management system that leverages the strengths of both document and relational databases.
