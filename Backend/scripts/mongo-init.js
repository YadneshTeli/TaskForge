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

// Create collections aligned with Mongoose schemas
db.createCollection('tasks', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['title'],
      properties: {
        title: {
          bsonType: 'string',
          description: 'Task title is required and must be a string'
        },
        description: {
          bsonType: ['string', 'null'],
          description: 'Task description'
        },
        status: {
          bsonType: 'string',
          description: 'Status string (e.g. todo, in-progress, done)'
        },
        priority: {
          bsonType: 'string',
          enum: ['low', 'medium', 'high', 'urgent'],
          description: 'Priority must be one of: low, medium, high, urgent'
        },
        projectId: {
          bsonType: ['objectId', 'string'],
          description: 'Project ID reference'
        },
        assignedTo: {
          bsonType: ['int', 'long', 'double', 'string', 'null'],
          description: 'PostgreSQL User ID reference'
        },
        createdBy: {
          bsonType: ['int', 'long', 'double', 'string'],
          description: 'Creator User ID reference'
        }
      }
    }
  }
});

db.createCollection('projects', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['name'],
      properties: {
        name: {
          bsonType: 'string',
          description: 'Project name is required and must be a string'
        },
        description: {
          bsonType: ['string', 'null'],
          description: 'Project description'
        },
        owner: {
          bsonType: ['int', 'long', 'double', 'string'],
          description: 'Owner PostgreSQL User ID'
        },
        members: {
          bsonType: 'array',
          description: 'Array of member user IDs'
        }
      }
    }
  }
});

db.createCollection('comments', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['content', 'author'],
      properties: {
        content: {
          bsonType: 'string',
          description: 'Comment content is required'
        },
        author: {
          bsonType: ['int', 'long', 'double', 'string'],
          description: 'Author PostgreSQL User ID is required'
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

db.projects.createIndex({ "owner": 1 });
db.projects.createIndex({ "members": 1 });
db.projects.createIndex({ "createdAt": -1 });

db.comments.createIndex({ "taskId": 1 });
db.comments.createIndex({ "author": 1 });
db.comments.createIndex({ "createdAt": -1 });

print('TaskForge MongoDB initialization completed!');
print('Created collections: tasks, projects, comments');
print('Created user: taskforge_app');
print('Created indexes for performance optimization');
