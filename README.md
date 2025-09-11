# TaskFlow - Task Management System

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18+-blue.svg)](https://reactjs.org/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0+-orange.svg)](https://mysql.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.0+-green.svg)](https://mongodb.com/)
[![Docker](https://img.shields.io/badge/Docker-Supported-blue.svg)](https://docker.com/)

A modern full-stack task management application built for a Backend/Full Stack Developer assignment. This project demonstrates proficiency in building scalable web applications with secure authentication, dual-database architecture, and production-ready deployment.

## Quick Start

```bash
# Clone and start the application
git clone https://github.com/ombhayde/taskflow-management.git
cd taskflow-management
docker-compose up -d
```

**Access Points:**
- Frontend: [http://localhost:3000](http://localhost:3000)
- API: [http://localhost:5000/api](http://localhost:5000/api)
- Login: `debug@example.com` / `debug123`

## Architecture and Stack

- Dual database: MySQL (users) + MongoDB (tasks)
- JWT-based authentication with bcrypt password hashing
- RESTful API with Express.js
- Frontend: Next.js 14 + React 18, Tailwind CSS, Radix UI
- Containerization with Docker and docker-compose
- Testing with Jest and Supertest

## Features

**Authentication:** User registration, secure login with JWT, protected routes  
**Task Management:** Full CRUD operations with pagination, search, filtering, and soft delete  
**Frontend:** Responsive React interface with real-time updates and theme support  
**Production Ready:** Docker containerization, comprehensive testing, API documentation, security headers

## Setup

**Requirements:** Docker and Docker Compose (or Node.js 18+ for manual setup)

### Using Docker (Recommended)
```bash
git clone https://github.com/ombhayde/taskflow-management.git
cd taskflow-management
docker-compose up -d
```

### Manual Setup
```bash
# Prerequisites: MySQL 8.0+, MongoDB 7.0+, Node.js 18+
git clone https://github.com/ombhayde/taskflow-management.git
cd taskflow-management
npm install

# Start backend
cd backend && npm install && npm run dev

# Start frontend (in new terminal)
npm run dev
```

## Environment Configuration

The application uses environment variables to manage configuration settings for different deployment scenarios.

### Docker Environment Configuration

When using Docker setup, most environment variables are automatically configured through the docker-compose file. No additional manual configuration is required for basic functionality.

### Manual Setup Environment Variables

For manual development setup, you'll need to create a `.env` file in the root directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# JWT Configuration (Change in production!)
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRES_IN=7d

# MySQL Database
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=taskflow
MYSQL_PASSWORD=password
MYSQL_DATABASE=task_management

# MongoDB
MONGODB_URI=mongodb://admin:password@localhost:27017/task_management?authSource=admin

# Frontend Configuration
FRONTEND_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### Production Environment Considerations

**Important Security Notes for Production Deployment:**

For production environments, ensure you implement the following security measures:

- Generate a strong JWT secret using: `openssl rand -base64 32`
- Use complex, unique passwords for all database connections
- Enable SSL/HTTPS certificates for secure communication
- Configure proper CORS origins to restrict unauthorized access
- Use environment-specific configuration values
- Implement proper logging and monitoring solutions

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/auth/profile` | Get profile (protected) |

### Tasks (All Protected)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tasks` | Get tasks (supports pagination, filtering) |
| POST | `/api/tasks` | Create task |
| PUT | `/api/tasks/:id` | Update task |
| DELETE | `/api/tasks/:id` | Delete task (soft delete) |
| GET | `/api/tasks/search?q=keyword` | Search tasks |
| GET | `/api/tasks/stats` | Get statistics |

**Query Parameters:** `page`, `limit`, `status`, `sortBy`, `sortOrder`

## Testing

```bash
npm test                  # Run all tests
npm run test:coverage     # Run with coverage
```

Test files: `tests/auth.test.js`, `tests/tasks.test.js` (24+ tests, 85%+ coverage)

## Docker Commands

```bash
docker-compose up -d      # Start all services
docker-compose logs -f    # View logs
docker-compose down       # Stop services
docker-compose ps         # Check status
```

## Database Design

**MySQL (Users):** `id`, `name`, `email`, `passwordHash`, `createdAt`  
**MongoDB (Tasks):** `_id`, `userId`, `title`, `description`, `status`, `priority`, `createdAt` + soft delete

## Project Structure

```
├── backend/          # Express API, controllers, routes, models
├── app/             # Next.js frontend (auth, dashboard)
├── tests/           # Jest tests for auth and tasks
├── docker-compose.yml
└── docs/ & postman/ # API documentation
```

## Security & Performance

**Security:** JWT authentication, bcrypt hashing, rate limiting, CORS, input validation, XSS protection  
**Performance:** Database indexing, connection pooling, pagination, soft deletes, Docker optimization

## Testing & Documentation

**Postman Collection:** Import `postman/TaskFlow-API.postman_collection.json` for API testing  
**Test Credentials:** `debug@example.com` / `debug123`  
**API Docs:** Available at `http://localhost:5000/api/docs`
---

**Built as a Backend/Full Stack Developer Intern Assignment**

*Demonstrates: REST API design, dual-database architecture, JWT authentication, React development, Docker containerization, and production deployment.*

**License:** MIT
