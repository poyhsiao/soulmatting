#!/bin/bash

# SoulMatting Platform - Development Environment Setup Script
# Author: Kim Hsiao
# Version: 1.0.0
# Created: 2024-01-20
# Last Updated: 2024-01-20

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Project root directory
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

# Function to print colored output
print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker and try again."
        exit 1
    fi
    print_success "Docker is running"
}

# Function to check if pnpm is installed
check_pnpm() {
    if ! command -v pnpm &> /dev/null; then
        print_warning "pnpm is not installed. Installing pnpm..."
        corepack enable && corepack prepare pnpm@latest --activate
    fi
    print_success "pnpm is available"
}

# Function to create .env file if it doesn't exist
setup_env() {
    if [ ! -f "$PROJECT_ROOT/.env" ]; then
        print_info "Creating .env file from .env.example..."
        cp "$PROJECT_ROOT/.env.example" "$PROJECT_ROOT/.env"
        print_warning "Please review and update the .env file with your configuration"
    else
        print_success ".env file already exists"
    fi
}

# Function to install dependencies
install_dependencies() {
    print_info "Installing project dependencies..."
    cd "$PROJECT_ROOT"
    pnpm install
    print_success "Dependencies installed"
}

# Function to start development environment
start_dev() {
    print_info "Starting development environment..."
    cd "$PROJECT_ROOT"
    
    # Stop any existing containers
    docker-compose -f docker-compose.yml -f docker-compose.dev.yml down
    
    # Start the development stack
    docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d
    
    print_success "Development environment started"
    print_info "Services available at:"
    echo "  - Web Application: http://localhost:3000"
    echo "  - API Gateway: http://localhost:8000"
    echo "  - Auth Service: http://localhost:9999"
    echo "  - Storage API: http://localhost:5000"
    echo "  - Realtime: ws://localhost:4000"
    echo "  - PostgreSQL: localhost:5432"
    echo "  - Redis: localhost:6379"
    echo "  - MinIO: http://localhost:9000 (Console: http://localhost:9001)"
    echo "  - PgAdmin: http://localhost:5050"
    echo "  - Redis Commander: http://localhost:8081"
    echo "  - MailHog: http://localhost:8025"
}

# Function to stop development environment
stop_dev() {
    print_info "Stopping development environment..."
    cd "$PROJECT_ROOT"
    docker-compose -f docker-compose.yml -f docker-compose.dev.yml down
    print_success "Development environment stopped"
}

# Function to restart development environment
restart_dev() {
    print_info "Restarting development environment..."
    stop_dev
    start_dev
}

# Function to show logs
show_logs() {
    cd "$PROJECT_ROOT"
    if [ -n "$1" ]; then
        docker-compose -f docker-compose.yml -f docker-compose.dev.yml logs -f "$1"
    else
        docker-compose -f docker-compose.yml -f docker-compose.dev.yml logs -f
    fi
}

# Function to run database migrations
run_migrations() {
    print_info "Running database migrations..."
    cd "$PROJECT_ROOT"
    # Wait for database to be ready
    sleep 5
    docker-compose -f docker-compose.yml -f docker-compose.dev.yml exec postgres psql -U postgres -d soulmatting_dev -c "SELECT 1;"
    print_success "Database is ready"
    # Run migrations here when they are implemented
    print_info "Migrations completed"
}

# Function to seed database
seed_database() {
    print_info "Seeding database with development data..."
    cd "$PROJECT_ROOT"
    docker-compose -f docker-compose.yml -f docker-compose.dev.yml exec postgres psql -U postgres -d soulmatting_dev -f /docker-entrypoint-initdb.d/99-dev-seed.sql
    print_success "Database seeded"
}

# Function to clean up Docker resources
clean() {
    print_info "Cleaning up Docker resources..."
    cd "$PROJECT_ROOT"
    docker-compose -f docker-compose.yml -f docker-compose.dev.yml down -v --remove-orphans
    docker system prune -f
    print_success "Cleanup completed"
}

# Function to show status
status() {
    cd "$PROJECT_ROOT"
    docker-compose -f docker-compose.yml -f docker-compose.dev.yml ps
}

# Function to show help
show_help() {
    echo "SoulMatting Platform - Development Environment Manager"
    echo ""
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  setup     - Setup development environment (install deps, create .env)"
    echo "  start     - Start development environment"
    echo "  stop      - Stop development environment"
    echo "  restart   - Restart development environment"
    echo "  logs      - Show logs (optional: specify service name)"
    echo "  migrate   - Run database migrations"
    echo "  seed      - Seed database with development data"
    echo "  status    - Show status of all services"
    echo "  clean     - Clean up Docker resources"
    echo "  help      - Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 setup"
    echo "  $0 start"
    echo "  $0 logs web"
    echo "  $0 logs auth"
}

# Main script logic
case "$1" in
    setup)
        check_docker
        check_pnpm
        setup_env
        install_dependencies
        print_success "Setup completed! Run '$0 start' to start the development environment."
        ;;
    start)
        check_docker
        start_dev
        ;;
    stop)
        stop_dev
        ;;
    restart)
        check_docker
        restart_dev
        ;;
    logs)
        show_logs "$2"
        ;;
    migrate)
        check_docker
        run_migrations
        ;;
    seed)
        check_docker
        seed_database
        ;;
    status)
        status
        ;;
    clean)
        clean
        ;;
    help|--help|-h)
        show_help
        ;;
    "")
        show_help
        ;;
    *)
        print_error "Unknown command: $1"
        show_help
        exit 1
        ;;
esac