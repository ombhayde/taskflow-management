# Docker Setup Guide

This guide will help you set up and run the TaskFlow application using Docker.

## Prerequisites

- Docker Engine 20.10+
- Docker Compose 2.0+
- Make (optional, for using Makefile commands)

## Quick Start

### 1. Clone and Setup
\`\`\`bash
git clone <repository-url>
cd task-management-app
make setup
\`\`\`

### 2. Start Development Environment
\`\`\`bash
make dev
\`\`\`

### 3. Start Production Environment
\`\`\`bash
make prod
\`\`\`

## Manual Setup

### Development Environment
\`\`\`bash
# Copy environment file
cp .env.docker .env

# Start development services
docker-compose -f docker-compose.dev.yml up -d

# Setup databases
docker-compose -f docker-compose.dev.yml exec backend-dev npm run setup
\`\`\`

### Production Environment
\`\`\`bash
# Copy environment file
cp .env.docker .env

# Build and start services
docker-compose up -d

# Setup databases
docker-compose exec backend npm run setup
\`\`\`

## Services

### Development Ports
- Frontend: http://localhost:3001
- Backend: http://localhost:5001
- MySQL: localhost:3307
- MongoDB: localhost:27018
- Redis: localhost:6380

### Production Ports
- Application: http://localhost (via Nginx)
- Frontend: http://localhost:3000
- Backend: http://localhost:5000
- MySQL: localhost:3306
- MongoDB: localhost:27017
- Redis: localhost:6379

## Environment Variables

Key environment variables in `.env.docker`:

\`\`\`env
# Security
JWT_SECRET=your_super_secret_jwt_key

# Database Credentials
MYSQL_ROOT_PASSWORD=rootpassword123
MYSQL_PASSWORD=taskflow_password_123
MONGO_ROOT_PASSWORD=mongodb_password_123

# Application URLs
FRONTEND_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:5000/api
\`\`\`

## Database Management

### Setup Databases
\`\`\`bash
make db-setup
# or
docker-compose exec backend npm run setup
\`\`\`

### Seed Sample Data
\`\`\`bash
make db-seed
# or
docker-compose exec backend npm run seed
\`\`\`

### Backup Databases
\`\`\`bash
make backup
\`\`\`

## Monitoring and Logs

### View Logs
\`\`\`bash
make logs
# or
docker-compose logs -f
\`\`\`

### Health Check
\`\`\`bash
make health
# or
curl http://localhost:5000/health
\`\`\`

### Service Status
\`\`\`bash
docker-compose ps
\`\`\`

## Troubleshooting

### Common Issues

1. **Port Conflicts**
   - Change ports in `.env.docker` if default ports are in use

2. **Database Connection Issues**
   - Ensure databases are healthy: `docker-compose ps`
   - Check logs: `docker-compose logs mysql mongodb`

3. **Permission Issues**
   - On Linux/Mac: `sudo chown -R $USER:$USER .`

4. **Build Issues**
   - Clean rebuild: `make clean && make build`

### Reset Everything
\`\`\`bash
make reset
\`\`\`

## Production Deployment

### Security Considerations
1. Change all default passwords in `.env.docker`
2. Use strong JWT secret
3. Enable SSL/TLS with proper certificates
4. Configure firewall rules
5. Set up monitoring and logging

### SSL Configuration
1. Place SSL certificates in `nginx/ssl/`
2. Update `nginx/nginx.conf` for HTTPS
3. Restart Nginx: `docker-compose restart nginx`

## Scaling

### Horizontal Scaling
\`\`\`bash
# Scale backend instances
docker-compose up -d --scale backend=3

# Scale with load balancer
docker-compose -f docker-compose.yml -f docker-compose.scale.yml up -d
\`\`\`

## Maintenance

### Update Images
\`\`\`bash
docker-compose pull
docker-compose up -d
\`\`\`

### Clean Up
\`\`\`bash
make clean
\`\`\`

### Backup Strategy
- Regular database backups: `make backup`
- Volume backups for persistent data
- Configuration backups

## Support

For issues and questions:
1. Check logs: `make logs`
2. Verify health: `make health`
3. Review this documentation
4. Check Docker and Docker Compose versions
