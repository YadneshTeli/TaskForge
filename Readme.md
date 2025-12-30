# TaskForge
![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)
![Contributors](https://img.shields.io/github/contributors/YadneshTeli/TaskForge)
![Issues](https://img.shields.io/github/issues/YadneshTeli/TaskForge)
![Pull Requests](https://img.shields.io/github/issues-pr/YadneshTeli/TaskForge)
![Stars](https://img.shields.io/github/stars/YadneshTeli/TaskForge?style=social)

## Overview
TaskForge is a full-stack, cross-platform project and task management solution with a modern **MongoDB-first hybrid architecture**. It provides robust features for team collaboration, project tracking, custom workflows, and reporting. The backend uses MongoDB Atlas for operational data and Supabase PostgreSQL for identity and analytics, while the frontend includes both a Flutter app and a React web client.

## Features
- User authentication and role-based access control
- Project and task creation with flexible custom fields
- Task assignment, tracking, and watchers
- Threaded comments with reactions
- Real-time notifications
- Activity logs and analytics
- File uploads (Cloudinary integration)
- RESTful API and GraphQL support
- Hybrid database architecture for optimal performance
- Comprehensive health monitoring

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
- **Node.js + Express**: Handles API requests and business logic
- **MongoDB Atlas**: Primary database for operational data (projects, tasks, comments)
- **Supabase PostgreSQL**: Identity, permissions, and analytics
- **Prisma ORM**: Type-safe database access for PostgreSQL
- **Mongoose**: Flexible document modeling for MongoDB
- **RESTful APIs & GraphQL**: Multiple API interfaces
- **Configurable Middleware**: Security, validation, rate limiting, authentication

## Frontend
- **Flutter App**: Cross-platform mobile and desktop client.
- **React Web Client**: Fast, modern web interface using Vite.

## Setup & Installation

### **Prerequisites**
- **Node.js ≥ 18**
- **npm ≥ 8** or **yarn**
- **MongoDB Atlas account** (or local MongoDB)
- **Supabase account** (or local PostgreSQL)

### Backend
1. Navigate to the `Backend` folder:
   ```sh
   cd Backend
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Set up environment variables:
   ```sh
   # Create .env file with:
   # MongoDB Atlas connection
   MONGODB_URI=mongodb+srv://...
   
   # Supabase PostgreSQL connection
   DATABASE_URL=postgresql://...
   
   # JWT and other secrets
   JWT_SECRET=your_secret_key
   CLOUDINARY_URL=your_cloudinary_url
   ```
4. Run database migrations:
   ```sh
   npx prisma migrate dev
   npx prisma generate
   ```
5. Start the server:
   ```sh
   npm start
   ```
6. Verify health:
   ```sh
   curl http://localhost:3000/api/health
   ```

### Architecture
TaskForge uses a **MongoDB-first hybrid architecture**:
- **90% of data** in MongoDB Atlas (projects, tasks, comments)
- **10% of data** in PostgreSQL (users, permissions, analytics)
- **Zero redundancy** - each piece of data lives in one database
- See [Backend/ARCHITECTURE.md](Backend/ARCHITECTURE.md) for details

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
We welcome contributions from the community!
Please read our [CONTRIBUTING](./CONTRIBUTING.md) for instructions.
 - For security issues, refer to our [SECURITY.md](/.github/SECURITY.md).
 - Code ownership and responsibilities are outlined in CODEOWNERS.
1. Fork the repository and create a new branch.
2. Make your changes and submit a pull request.
3. Ensure code follows project conventions.

## License
This project is licensed under the [MIT License](./LICENSE).

## 🤝 Code of Conduct
Please read our [Code of Conduct](./CODE_OF_CONDUCT.md) to ensure a respectful and inclusive environment.

## 📬 Contact
For queries or collaborations, reach out to Yadnesh Teli at [yadneshteli.dev@gmail.com].