# TaskForge

## Overview
TaskForge is a full-stack, cross-platform project and task management solution. It provides robust features for team collaboration, project tracking, custom workflows, and reporting. The backend is built with Node.js, Express, and Prisma ORM, while the frontend includes both a Flutter app and a React web client.

## Features
- User authentication and role management
- Project and task creation, assignment, and tracking
- Custom fields, priorities, labels, and reminders
- Comments, notifications, and activity logs
- Reporting and analytics
- File uploads (Cloudinary integration)
- RESTful API endpoints
- Extensible architecture for custom workflows

## Project Structure
```
TaskForge/
├── Backend/
│   ├── src/
│   │   ├── models/         # Database models (User, Project, Task, etc.)
│   │   ├── services/       # Business logic for each entity
│   │   ├── middleware/     # Express middleware (auth, error handling, etc.)
│   │   ├── routes/         # API route definitions
│   │   ├── utils/          # Helper functions
│   │   ├── config/         # Configuration files
│   ├── prisma/             # Prisma schema and migrations
│   ├── generated/prisma/   # Auto-generated Prisma client
├── Frontend/
│   ├── App/taskforge/      # Flutter app (multi-platform)
│   ├── Web/                # React + Vite web client
```

## Backend
- **Node.js + Express**: Handles API requests and business logic.
- **Prisma ORM**: Manages database schema and queries.
- **RESTful APIs**: Exposes endpoints for all core features.
- **Configurable Middleware**: Security, validation, rate limiting, etc.

## Frontend
- **Flutter App**: Cross-platform mobile and desktop client.
- **React Web Client**: Fast, modern web interface using Vite.

## Setup & Installation

### Backend
1. Navigate to the `Backend` folder:
   ```sh
   cd Backend
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Set up environment variables (see `src/config/` for examples).
4. Run database migrations:
   ```sh
   npx prisma migrate dev
   ```
5. Start the server:
   ```sh
   npm start
   ```

### Frontend (Flutter)
1. Navigate to `Frontend/App/taskforge`:
   ```sh
   cd Frontend/App/taskforge
   ```
2. Install dependencies:
   ```sh
   flutter pub get
   ```
3. Run the app:
   ```sh
   flutter run
   ```

### Frontend (Web)
1. Navigate to `Frontend/Web`:
   ```sh
   cd Frontend/Web
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Start the development server:
   ```sh
   npm run dev
   ```

## Usage
- Access the web client at `http://localhost:3000` (default Vite port).
- Use the Flutter app for mobile/desktop platforms.
- Interact with the backend via RESTful APIs for all project, task, user, and reporting features.

## Contributing
1. Fork the repository and create a new branch.
2. Make your changes and submit a pull request.
3. Ensure code follows project conventions and passes all tests.

## License
This project is licensed under the MIT License.