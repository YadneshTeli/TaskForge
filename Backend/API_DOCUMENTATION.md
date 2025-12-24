# TaskForge API Documentation

## Overview
This document describes all available REST API endpoints for the TaskForge backend application.

**Base URL**: `http://localhost:4000/api`

**Authentication**: Most endpoints require a JWT token passed in the `Authorization` header:
```
Authorization: Bearer <your-jwt-token>
```

---

## 🔐 Authentication Routes (`/api/auth`)

### Register New User
- **POST** `/api/auth/register`
- **Body**:
  ```json
  {
    "username": "string (min: 3 chars)",
    "email": "string (valid email)",
    "password": "string (min: 8 chars, 1 uppercase, 1 number)",
    "fullName": "string",
    "role": "viewer|user|manager|admin (default: user)"
  }
  ```
- **Response**: User object + JWT token

### Login
- **POST** `/api/auth/login`
- **Body**:
  ```json
  {
    "email": "string",
    "password": "string"
  }
  ```
- **Response**: User object + JWT token

### Refresh Token
- **POST** `/api/auth/refresh-token`
- **Body**:
  ```json
  {
    "refreshToken": "string"
  }
  ```
- **Response**: New JWT token

---

## 👤 User Routes (`/api/users`)

### Get Current User Profile
- **GET** `/api/users/profile`
- **Auth**: Required
- **Response**: Current user's profile (without password)

### Update User Profile
- **PUT** `/api/users/profile`
- **Auth**: Required
- **Body**:
  ```json
  {
    "fullName": "string (optional, min: 2 chars)",
    "bio": "string (optional, max: 500 chars)",
    "profilePicture": "string (optional, URL)"
  }
  ```
- **Response**: Updated user profile

### Change Password
- **PUT** `/api/users/password`
- **Auth**: Required
- **Body**:
  ```json
  {
    "currentPassword": "string",
    "newPassword": "string (min: 8 chars, 1 uppercase, 1 number)"
  }
  ```
- **Response**: Success message

### Get User by ID
- **GET** `/api/users/:id`
- **Auth**: Required
- **Response**: User profile (without password)

---

## 📋 Project Routes (`/api/project`)

### Create Project
- **POST** `/api/project/create`
- **Auth**: Required
- **Body**:
  ```json
  {
    "name": "string",
    "description": "string",
    "dueDate": "date (optional)",
    "status": "active|completed|archived (default: active)"
  }
  ```
- **Response**: Created project

### Get Project by ID
- **GET** `/api/project/:id`
- **Auth**: Required
- **Response**: Project details with tasks and members

### Get User's Projects
- **GET** `/api/project/user/:userId`
- **Auth**: Required
- **Response**: Array of projects

### Update Project
- **PUT** `/api/project/:id`
- **Auth**: Required
- **Body**: Any project fields to update
- **Response**: Updated project

### Delete Project
- **DELETE** `/api/project/:id`
- **Auth**: Required
- **Response**: Success message

### Add Member to Project
- **POST** `/api/project/:id/member`
- **Auth**: Required (Manager/Admin)
- **Body**:
  ```json
  {
    "userId": "string"
  }
  ```
- **Response**: Updated project

### Remove Member from Project
- **DELETE** `/api/project/:id/member/:userId`
- **Auth**: Required (Manager/Admin)
- **Response**: Updated project

### Upload File to Project
- **POST** `/api/project/:id/upload`
- **Auth**: Required (Manager/Admin)
- **Content-Type**: `multipart/form-data`
- **Body**: Form data with `file` field
- **Response**:
  ```json
  {
    "message": "File uploaded successfully",
    "url": "string (file URL)",
    "filename": "string"
  }
  ```

### Generate Project Report
- **POST** `/api/project/:id/report`
- **Auth**: Required (Manager/Admin)
- **Body**:
  ```json
  {
    "format": "pdf|csv (default: pdf)"
  }
  ```
- **Response**:
  ```json
  {
    "message": "Report generated successfully",
    "path": "string (report file path)",
    "format": "string"
  }
  ```

### Notify Project User
- **POST** `/api/project/:id/notify`
- **Auth**: Required
- **Body**:
  ```json
  {
    "userId": "string",
    "content": "string"
  }
  ```
- **Response**: Created notification

---

## 📝 Task Routes (`/api/tasks`)

### Create Task
- **POST** `/api/tasks/create`
- **Auth**: Required
- **Body**:
  ```json
  {
    "title": "string",
    "description": "string",
    "projectId": "string",
    "assignedTo": "string (user ID, optional)",
    "dueDate": "date (optional)",
    "priority": "low|medium|high (default: medium)",
    "status": "todo|in-progress|done (default: todo)"
  }
  ```
- **Response**: Created task

### Get Tasks by Project
- **GET** `/api/tasks/project/:projectId`
- **Auth**: Required
- **Response**: Array of tasks

### Update Task
- **PUT** `/api/tasks/:id`
- **Auth**: Required
- **Body**: Any task fields to update
- **Response**: Updated task

### Delete Task
- **DELETE** `/api/tasks/:id`
- **Auth**: Required
- **Response**: Success message

---

## 💬 Comment Routes (`/api/comments`)

### Create Comment
- **POST** `/api/comments/create`
- **Auth**: Required
- **Body**:
  ```json
  {
    "text": "string",
    "taskId": "string",
    "projectId": "string (optional)"
  }
  ```
- **Response**: Created comment

### Get Comments by Task
- **GET** `/api/comments/task/:taskId`
- **Auth**: Required
- **Response**: Array of comments

### Delete Comment
- **DELETE** `/api/comments/:id`
- **Auth**: Required
- **Response**: Success message

---

## 🔔 Notification Routes (`/api/notifications`)

### Get User's Notifications
- **GET** `/api/notifications`
- **Auth**: Required
- **Response**: Array of notifications

### Create Notification
- **POST** `/api/notifications`
- **Auth**: Required
- **Body**:
  ```json
  {
    "content": "string",
    "userId": "string (optional, defaults to current user)"
  }
  ```
- **Response**: Created notification

### Mark Notification as Seen
- **PUT** `/api/notifications/:id/seen`
- **Auth**: Required
- **Response**: Updated notification

### Mark All Notifications as Seen
- **PUT** `/api/notifications/mark-all-seen`
- **Auth**: Required
- **Response**: Success message

---

## 📤 File Upload Routes (`/api/file`)

### Upload File
- **POST** `/api/file/upload`
- **Auth**: Required (Manager/Admin only)
- **Content-Type**: `multipart/form-data`
- **Body**: Form data with `file` field
- **Allowed Types**: jpeg, jpg, png, pdf, doc, docx, xls, xlsx, txt
- **Size Limit**: 10MB
- **Response**:
  ```json
  {
    "url": "string (Cloudinary URL or local path)"
  }
  ```

---

## 📊 Report Routes (`/api/report`)

### Generate Report
- **POST** `/api/report/generate`
- **Auth**: Required (Manager/Admin)
- **Body**:
  ```json
  {
    "projectId": "string",
    "format": "pdf|csv (default: pdf)"
  }
  ```
- **Response**:
  ```json
  {
    "path": "string (report file path)"
  }
  ```

---

## 👑 Admin Routes (`/api/admin`)

### Get All Users
- **GET** `/api/admin/users`
- **Auth**: Required (Admin only)
- **Response**: Array of all users

### Update User Role
- **PUT** `/api/admin/users/:id/role`
- **Auth**: Required (Admin only)
- **Body**:
  ```json
  {
    "role": "viewer|user|manager|admin"
  }
  ```
- **Response**: Updated user

### Delete User
- **DELETE** `/api/admin/users/:id`
- **Auth**: Required (Admin only)
- **Response**: Success message

---

## 🏥 Health Check

### Server Health
- **GET** `/api/health`
- **No Auth Required**
- **Response**:
  ```json
  {
    "status": "OK",
    "timestamp": "ISO date",
    "server": "TaskForge Backend",
    "version": "1.0.0",
    "environment": "development|production",
    "uptime": "number (seconds)",
    "checks": {
      "mongodb": "connected|disconnected",
      "prisma": "connected|disconnected"
    }
  }
  ```

---

## 🎯 Role-Based Permissions

### Roles (in order of privilege):
1. **viewer** - Read-only access
2. **user** - Can create and manage own tasks
3. **manager** - Can manage projects and teams
4. **admin** - Full system access

### Permission Matrix:

| Action | Viewer | User | Manager | Admin |
|--------|--------|------|---------|-------|
| View Projects | ✅ | ✅ | ✅ | ✅ |
| Create Tasks | ❌ | ✅ | ✅ | ✅ |
| Upload Files | ❌ | ❌ | ✅ | ✅ |
| Generate Reports | ❌ | ❌ | ✅ | ✅ |
| Manage Users | ❌ | ❌ | ❌ | ✅ |

---

## 🚨 Error Responses

All errors follow this format:

```json
{
  "error": "Error message",
  "status": 400,
  "timestamp": "ISO date",
  "path": "/api/endpoint"
}
```

### Common Status Codes:
- **200** - Success
- **201** - Created
- **400** - Bad Request (validation error)
- **401** - Unauthorized (missing/invalid token)
- **403** - Forbidden (insufficient permissions)
- **404** - Not Found
- **409** - Conflict (duplicate resource)
- **429** - Too Many Requests (rate limited)
- **500** - Internal Server Error
- **501** - Not Implemented

---

## 📦 Service Layer

All routes use the following services internally:

1. **attachment.service.js** - Handle task attachments
2. **comment.service.js** - Manage comments
3. **log.service.js** - System logging
4. **notification.service.js** - User notifications
5. **project.service.js** - Project CRUD operations
6. **report.service.js** - PDF/CSV report generation
7. **task.service.js** - Task management + Prisma sync
8. **upload.service.js** - File uploads to Cloudinary
9. **user.service.js** - User profile management

---

## 🔧 Environment Variables

Required environment variables:

```env
NODE_ENV=development|production
PORT=4000
MONGODB_URI=mongodb://localhost:27017/taskforge
DATABASE_URL=postgresql://user:pass@localhost:5432/taskforge
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
CORS_ORIGIN=http://localhost:3000,http://localhost:5173
```

---

## 📝 Notes

- All dates should be in ISO 8601 format
- File uploads support Cloudinary with local fallback
- Rate limiting: 100 requests per 15 minutes per IP
- GraphQL endpoint also available at `/graphql`
- All timestamps are in UTC

---

**Last Updated**: December 24, 2025
**Version**: 1.0.0
