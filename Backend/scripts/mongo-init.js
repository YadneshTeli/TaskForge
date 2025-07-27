// Initialize TaskForge MongoDB Database
// This script runs when the MongoDB container is first created

print('Starting TaskForge MongoDB initialization...');

// Switch to the taskforge_mongo database
db = db.getSiblingDB('taskforge_mongo');

// Create a user for the taskforge application
db.createUser({
  user: 'taskforge_app',
  pwd: 'taskforge_app_2024',
  roles: [
    {
      role: 'readWrite',
      db: 'taskforge_mongo'
    }
  ]
});

// Create collections with validation
db.createCollection('tasks', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['title', 'status', 'createdAt'],
      properties: {
        title: {
          bsonType: 'string',
          description: 'Task title is required and must be a string'
        },
        description: {
          bsonType: 'string',
          description: 'Task description must be a string'
        },
        status: {
          bsonType: 'string',
          enum: ['todo', 'in-progress', 'done'],
          description: 'Status must be one of: todo, in-progress, done'
        },
        priority: {
          bsonType: 'string',
          enum: ['low', 'medium', 'high'],
          description: 'Priority must be one of: low, medium, high'
        },
        projectId: {
          bsonType: 'string',
          description: 'Project ID reference'
        },
        assignedTo: {
          bsonType: 'string',
          description: 'User ID reference'
        },
        createdAt: {
          bsonType: 'date',
          description: 'Creation date is required'
        },
        updatedAt: {
          bsonType: 'date',
          description: 'Update date'
        },
        dueDate: {
          bsonType: 'date',
          description: 'Due date'
        }
      }
    }
  }
});

db.createCollection('projects', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['name', 'ownerId', 'createdAt'],
      properties: {
        name: {
          bsonType: 'string',
          description: 'Project name is required and must be a string'
        },
        description: {
          bsonType: 'string',
          description: 'Project description must be a string'
        },
        ownerId: {
          bsonType: 'string',
          description: 'Owner ID is required'
        },
        members: {
          bsonType: 'array',
          items: {
            bsonType: 'string'
          },
          description: 'Array of member user IDs'
        },
        createdAt: {
          bsonType: 'date',
          description: 'Creation date is required'
        }
      }
    }
  }
});

db.createCollection('comments', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['taskId', 'userId', 'text', 'createdAt'],
      properties: {
        taskId: {
          bsonType: 'string',
          description: 'Task ID is required'
        },
        userId: {
          bsonType: 'string',
          description: 'User ID is required'
        },
        text: {
          bsonType: 'string',
          description: 'Comment text is required'
        },
        createdAt: {
          bsonType: 'date',
          description: 'Creation date is required'
        }
      }
    }
  }
});

// Create indexes for better performance
db.tasks.createIndex({ "projectId": 1 });
db.tasks.createIndex({ "assignedTo": 1 });
db.tasks.createIndex({ "status": 1 });
db.tasks.createIndex({ "createdAt": -1 });
db.tasks.createIndex({ "dueDate": 1 });

db.projects.createIndex({ "ownerId": 1 });
db.projects.createIndex({ "members": 1 });
db.projects.createIndex({ "createdAt": -1 });

db.comments.createIndex({ "taskId": 1 });
db.comments.createIndex({ "userId": 1 });
db.comments.createIndex({ "createdAt": -1 });

print('TaskForge MongoDB initialization completed!');
print('Created collections: tasks, projects, comments');
print('Created user: taskforge_app');
print('Created indexes for performance optimization');
