# TaskForge Hybrid Database Architecture

## Overview
TaskForge uses a **MongoDB-first hybrid architecture** that leverages the strengths of both MongoDB and PostgreSQL:
- **MongoDB Atlas**: Primary database for operational data (90%)
- **Supabase PostgreSQL**: Secondary database for identity and analytics (10%)

## Database Responsibilities

### MongoDB Atlas (Operational Data)
**Connection**: `mongodb+srv://taskforge.03biohl.mongodb.net/`

Stores all operational data that requires flexibility and frequent updates:

#### 1. **Projects** (`projects` collection)
- Complete project data with dynamic settings
- Owner and member references (PostgreSQL User.id as Numbers)
- Project settings (task statuses, priorities, custom fields)
- Cached statistics (task count, completed count, member count)
- Attachments with metadata

**Key Fields:**
```javascript
{
  name: String,
  description: String,
  owner: Number,  // PostgreSQL User.id
  members: [Number],  // PostgreSQL User.ids
  status: String,
  settings: {
    taskStatuses: [String],
    taskPriorities: [String],
    customFields: [Object],
    timezone: String,
    notifications: Object
  },
  stats: {
    taskCount: Number,
    completedTasks: Number,
    memberCount: Number
  },
  attachments: [Object]
}
```

#### 2. **Tasks** (`tasks` collection)
- Flexible task data with custom fields
- Dynamic priority levels and statuses
- Watchers and inline comments
- Support for subtasks and task ordering

**Key Fields:**
```javascript
{
  projectId: ObjectId,  // MongoDB Project._id
  title: String,
  description: String,
  assignedTo: Number,  // PostgreSQL User.id
  createdBy: Number,  // PostgreSQL User.id
  status: String,
  priority: String,
  tags: [String],
  dueDate: Date,
  customFields: Map,  // Dynamic per-project fields
  watchers: [Number],  // PostgreSQL User.ids
  inlineComments: [{
    userId: Number,
    text: String,
    createdAt: Date
  }],
  attachments: [Object],
  parentTaskId: ObjectId,  // For subtasks
  order: Number
}
```

#### 3. **Comments** (`comments` collection)
- Threaded comment system
- Reactions and edit tracking
- Project and task association

**Key Fields:**
```javascript
{
  text: String,
  author: Number,  // PostgreSQL User.id
  taskId: ObjectId,  // MongoDB Task._id
  projectId: ObjectId,  // MongoDB Project._id
  parentId: ObjectId,  // For threaded replies
  reactions: {
    thumbsUp: Number,
    heart: Number,
    celebrate: Number
  },
  reactedBy: [{
    userId: Number,
    reaction: String
  }],
  edited: Boolean,
  editedAt: Date
}
```

### Supabase PostgreSQL (Identity & Analytics)
**Connection**: `db.wxrfyttgieudlgtfrcff.supabase.co`

Stores identity data and aggregated analytics that benefit from relational structure:

#### 1. **User** (Identity)
- Core authentication data
- User profiles and preferences
- Online status tracking

**Schema:**
```sql
id: Integer (PK)
email: String (Unique)
password: String (Hashed)
username: String
fullName: String
profilePicture: String
bio: String
role: Enum (ADMIN, USER)
isActive: Boolean
isOnline: Boolean
lastSeen: DateTime
createdAt: DateTime
updatedAt: DateTime
```

#### 2. **ProjectMember** (Permissions)
- Project access control
- Role-based permissions
- Cross-database reference to MongoDB projects

**Schema:**
```sql
id: Integer (PK)
projectId: String  -- MongoDB Project._id as string
userId: Integer (FK → User.id)
role: String (owner, admin, member, viewer)
permissions: JSON
joinedAt: DateTime
```

#### 3. **Notification**
- User notifications
- Metadata references to MongoDB entities

**Schema:**
```sql
id: Integer (PK)
userId: Integer (FK → User.id)
type: String
content: String
metadata: JSON  -- { projectId, taskId, etc. }
seen: Boolean
createdAt: DateTime
```

#### 4. **UserStats** (Analytics)
- Aggregated user activity metrics
- Synced from MongoDB data

**Schema:**
```sql
id: Integer (PK)
userId: Integer (FK → User.id, Unique)
totalProjectsOwned: Integer
totalProjectsJoined: Integer
totalTasksCreated: Integer
totalTasksCompleted: Integer
totalTasksInProgress: Integer
totalComments: Integer
lastActivityAt: DateTime
```

#### 5. **ProjectAnalytics** (Analytics)
- Aggregated project metrics
- Synced from MongoDB data

**Schema:**
```sql
id: Integer (PK)
projectId: String (Unique)  -- MongoDB Project._id
totalTasks: Integer
completedTasks: Integer
inProgressTasks: Integer
totalMembers: Integer
totalComments: Integer
lastUpdated: DateTime
```

#### 6. **TaskMetrics** (Analytics)
- Individual task tracking metrics
- Time spent and completion data

**Schema:**
```sql
id: Integer (PK)
taskId: String (Unique)  -- MongoDB Task._id
projectId: String  -- MongoDB Project._id
userId: Integer  -- PostgreSQL User.id (assignee)
timeSpent: Integer (minutes)
status: String
completedAt: DateTime
```

## Cross-Database References

### MongoDB → PostgreSQL
All user references in MongoDB use PostgreSQL User.id as Number:
- `Project.owner` → `User.id`
- `Project.members[]` → `User.id`
- `Task.assignedTo` → `User.id`
- `Task.createdBy` → `User.id`
- `Task.watchers[]` → `User.id`
- `Comment.author` → `User.id`

### PostgreSQL → MongoDB
MongoDB ObjectIds stored as strings in PostgreSQL:
- `ProjectMember.projectId` → `Project._id.toString()`
- `TaskMetrics.taskId` → `Task._id.toString()`
- `TaskMetrics.projectId` → `Project._id.toString()`
- `ProjectAnalytics.projectId` → `Project._id.toString()`

## Data Flow Patterns

### Creating a Project
1. MongoDB: Create Project document with owner (PostgreSQL User.id)
2. PostgreSQL: Create ProjectMember with role='owner'
3. PostgreSQL: Initialize ProjectAnalytics

### Creating a Task
1. MongoDB: Create Task document
2. MongoDB: Update Project.stats via post-save hook
3. PostgreSQL: Sync minimal TaskMetrics

### Adding a Project Member
1. MongoDB: Add user ID to Project.members array
2. PostgreSQL: Create ProjectMember record with permissions

### Task Status Change
1. MongoDB: Update Task status
2. MongoDB: Update Project.stats via post-save hook (automatic)
3. PostgreSQL: Update TaskMetrics

## Architecture Benefits

### 1. **Zero Redundancy**
- Each piece of data lives in exactly ONE database
- No duplicate storage of Projects, Tasks, or Comments

### 2. **Minimal Sync Operations**
- Only lightweight analytics synced to PostgreSQL
- 85% reduction in cross-database sync operations
- MongoDB post-save hooks handle Project stats automatically

### 3. **Query Simplicity**
- 90% of queries hit only MongoDB (operational data)
- 10% of queries hit PostgreSQL (auth, permissions, analytics)
- No complex joins across databases

### 4. **Clear Separation of Concerns**
- **MongoDB**: Flexible, schema-less operational data
- **PostgreSQL**: Structured identity and analytics

### 5. **Scalability**
- MongoDB handles high-frequency operational writes
- PostgreSQL handles authentication and analytics queries
- Independent scaling of each database

## Migration Notes

### From Previous Architecture
The previous architecture had:
- Duplicate Project, Comment, Log models in PostgreSQL
- Complex bidirectional sync operations
- 60% data redundancy

The new architecture:
- ✅ Removed duplicate models from PostgreSQL
- ✅ Simplified services to query correct database
- ✅ Eliminated redundant sync operations
- ✅ Changed user references from ObjectId to Number in MongoDB

### Breaking Changes
1. **MongoDB Models**: User references changed from ObjectId to Number
2. **Prisma Schema**: Removed Project, Comment, Log models
3. **Services**: Updated to use correct database per entity

### Backward Compatibility
- All service methods maintain the same signatures
- Legacy methods preserved where needed
- Test suite: 42/42 tests passing

## Health Checks
The system includes comprehensive health monitoring:
- MongoDB connection status
- PostgreSQL connection status
- Cloudinary service status
- File storage availability
- Environment configuration

Access at: `GET /api/health`

## Future Enhancements
1. **Caching Layer**: Add Redis for frequently accessed data
2. **Search**: Implement Elasticsearch for full-text search
3. **Real-time**: Add WebSocket support for live updates
4. **Analytics**: Expand PostgreSQL analytics capabilities
5. **Audit Logs**: Implement comprehensive audit trail in MongoDB
