

.PHONY: help build up down logs clean dev prod setup


help:
	@echo "TaskFlow Docker Commands:"
	@echo "  make setup     - Initial setup and build"
	@echo "  make dev       - Start development environment"
	@echo "  make prod      - Start production environment"
	@echo "  make build     - Build all Docker images"
	@echo "  make up        - Start all services"
	@echo "  make down      - Stop all services"
	@echo "  make logs      - View logs"
	@echo "  make clean     - Clean up containers and volumes"
	@echo "  make reset     - Reset everything (clean + setup)"


setup:
	@echo "Setting up TaskFlow..."
	cp .env.docker .env
	docker-compose build
	@echo "Setup complete! Run 'make dev' or 'make prod'"


dev:
	@echo "Starting development environment..."
	docker-compose -f docker-compose.dev.yml up -d
	@echo "Development environment started!"
	@echo "Frontend: http://localhost:3001"
	@echo "Backend: http://localhost:5001"
	@echo "MySQL: localhost:3307"
	@echo "MongoDB: localhost:27018"


prod:
	@echo "Starting production environment..."
	docker-compose up -d
	@echo "Production environment started!"
	@echo "Application: http://localhost"
	@echo "Frontend: http://localhost:3000"
	@echo "Backend: http://localhost:5000"


build:
	@echo "Building Docker images..."
	docker-compose build --no-cache

up:
	docker-compose up -d

down:
	docker-compose down
	docker-compose -f docker-compose.dev.yml down

logs:
	docker-compose logs -f

clean:
	@echo "Cleaning up containers and volumes..."
	docker-compose down -v --remove-orphans
	docker-compose -f docker-compose.dev.yml down -v --remove-orphans
	docker system prune -f
	@echo "Cleanup complete!"

reset: clean setup

db-setup:
	@echo "Setting up databases..."
	docker-compose exec backend npm run setup
	@echo "Database setup complete!"

db-seed:
	@echo "Seeding database..."
	docker-compose exec backend npm run seed
	@echo "Database seeded!"

backup:
	@echo "Creating backup..."
	mkdir -p backups
	docker exec taskflow-mysql mysqldump -u root -prootpassword123 task_management > backups/mysql-backup-$(shell date +%Y%m%d-%H%M%S).sql
	docker exec taskflow-mongodb mongodump --uri="mongodb://admin:mongodb_password_123@localhost:27017/task_management?authSource=admin" --out=/tmp/backup
	docker cp taskflow-mongodb:/tmp/backup backups/mongodb-backup-$(shell date +%Y%m%d-%H%M%S)
	@echo "Backup created in backups/ directory"

health:
	@echo "Checking service health..."
	@docker-compose ps
	@echo "\nBackend health:"
	@curl -f http://localhost:5000/health || echo "Backend unhealthy"
	@echo "\nFrontend health:"
	@curl -f http://localhost:3000 || echo "Frontend unhealthy"
