#!/bin/bash

# SoulMatting Platform - Secrets Management Script
# Author: Kim Hsiao
# Version: 1.0.0
# Created: 2024-01-20
# Last Updated: 2024-01-20
#
# This script helps manage Kubernetes secrets for the SoulMatting platform
# It provides functions to create, update, and validate secrets

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
NAMESPACE="soulmatting"
ENVIRONMENT="development"
SECRETS_FILE="secrets.yaml"
ENV_FILE=".env"

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

# Function to show usage
show_usage() {
    cat << EOF
Usage: $0 [OPTIONS] COMMAND

Commands:
  create-all          Create all secrets from environment variables
  create-app          Create application secrets
  create-db           Create database secrets
  create-redis        Create Redis secrets
  create-elastic      Create Elasticsearch secrets
  create-registry     Create container registry secrets
  create-external     Create external service secrets
  create-monitoring   Create monitoring secrets
  create-tls          Create TLS secrets
  validate            Validate all secrets exist
  delete-all          Delete all secrets
  backup              Backup secrets to file
  restore             Restore secrets from file
  generate-passwords  Generate random passwords
  help                Show this help message

Options:
  -n, --namespace NAMESPACE    Kubernetes namespace (default: soulmatting)
  -e, --environment ENV        Environment (development|staging|production)
  -f, --env-file FILE         Environment file (default: .env)
  --dry-run                   Show what would be done without executing
  -v, --verbose               Verbose output

Examples:
  $0 create-all
  $0 -e production create-app
  $0 -n my-namespace validate
  $0 --dry-run create-db

EOF
}

# Function to check prerequisites
check_prerequisites() {
    print_info "Checking prerequisites..."
    
    # Check if kubectl is installed
    if ! command -v kubectl &> /dev/null; then
        print_error "kubectl is not installed or not in PATH"
        exit 1
    fi
    
    # Check if kubectl can connect to cluster
    if ! kubectl cluster-info &> /dev/null; then
        print_error "Cannot connect to Kubernetes cluster"
        exit 1
    fi
    
    # Check if namespace exists
    if ! kubectl get namespace "$NAMESPACE" &> /dev/null; then
        print_warning "Namespace '$NAMESPACE' does not exist. Creating..."
        kubectl create namespace "$NAMESPACE"
    fi
    
    print_success "Prerequisites check passed"
}

# Function to base64 encode a string
base64_encode() {
    echo -n "$1" | base64 | tr -d '\n'
}

# Function to generate random password
generate_password() {
    local length=${1:-32}
    openssl rand -base64 $length | tr -d "=+/" | cut -c1-$length
}

# Function to load environment variables
load_env_vars() {
    if [[ -f "$ENV_FILE" ]]; then
        print_info "Loading environment variables from $ENV_FILE"
        set -a
        source "$ENV_FILE"
        set +a
    else
        print_warning "Environment file $ENV_FILE not found"
    fi
}

# Function to create application secrets
create_app_secrets() {
    print_info "Creating application secrets..."
    
    local jwt_secret=${JWT_SECRET:-$(generate_password 64)}
    local encryption_key=${ENCRYPTION_KEY:-$(generate_password 32)}
    local api_key=${API_KEY:-$(generate_password 32)}
    local webhook_secret=${WEBHOOK_SECRET:-$(generate_password 32)}
    
    kubectl create secret generic app-secrets \
        --namespace="$NAMESPACE" \
        --from-literal=jwt-secret="$jwt_secret" \
        --from-literal=encryption-key="$encryption_key" \
        --from-literal=api-key="$api_key" \
        --from-literal=webhook-secret="$webhook_secret" \
        --dry-run=client -o yaml | kubectl apply -f -
    
    print_success "Application secrets created"
}

# Function to create database secrets
create_db_secrets() {
    print_info "Creating database secrets..."
    
    local postgres_password=${POSTGRES_PASSWORD:-$(generate_password 32)}
    local replication_password=${POSTGRES_REPLICATION_PASSWORD:-$(generate_password 32)}
    
    kubectl create secret generic postgresql-secret \
        --namespace="$NAMESPACE" \
        --from-literal=postgres-password="$postgres_password" \
        --from-literal=replication-password="$replication_password" \
        --dry-run=client -o yaml | kubectl apply -f -
    
    print_success "Database secrets created"
}

# Function to create Redis secrets
create_redis_secrets() {
    print_info "Creating Redis secrets..."
    
    local redis_password=${REDIS_PASSWORD:-$(generate_password 32)}
    
    kubectl create secret generic redis-secret \
        --namespace="$NAMESPACE" \
        --from-literal=redis-password="$redis_password" \
        --dry-run=client -o yaml | kubectl apply -f -
    
    print_success "Redis secrets created"
}

# Function to create Elasticsearch secrets
create_elastic_secrets() {
    print_info "Creating Elasticsearch secrets..."
    
    local elastic_password=${ELASTIC_PASSWORD:-$(generate_password 32)}
    
    kubectl create secret generic elasticsearch-secret \
        --namespace="$NAMESPACE" \
        --from-literal=elastic-password="$elastic_password" \
        --dry-run=client -o yaml | kubectl apply -f -
    
    print_success "Elasticsearch secrets created"
}

# Function to create container registry secrets
create_registry_secrets() {
    print_info "Creating container registry secrets..."
    
    if [[ -z "${GITHUB_TOKEN:-}" ]]; then
        print_error "GITHUB_TOKEN environment variable is required"
        return 1
    fi
    
    local github_username=${GITHUB_USERNAME:-$(whoami)}
    
    kubectl create secret docker-registry ghcr-secret \
        --namespace="$NAMESPACE" \
        --docker-server=ghcr.io \
        --docker-username="$github_username" \
        --docker-password="$GITHUB_TOKEN" \
        --docker-email="${GITHUB_EMAIL:-$github_username@users.noreply.github.com}" \
        --dry-run=client -o yaml | kubectl apply -f -
    
    print_success "Container registry secrets created"
}

# Function to create external service secrets
create_external_secrets() {
    print_info "Creating external service secrets..."
    
    kubectl create secret generic external-service-secrets \
        --namespace="$NAMESPACE" \
        --from-literal=stripe-secret-key="${STRIPE_SECRET_KEY:-}" \
        --from-literal=stripe-webhook-secret="${STRIPE_WEBHOOK_SECRET:-}" \
        --from-literal=paypal-client-secret="${PAYPAL_CLIENT_SECRET:-}" \
        --from-literal=sendgrid-api-key="${SENDGRID_API_KEY:-}" \
        --from-literal=smtp-password="${SMTP_PASSWORD:-}" \
        --from-literal=twilio-auth-token="${TWILIO_AUTH_TOKEN:-}" \
        --from-literal=aws-access-key-id="${AWS_ACCESS_KEY_ID:-}" \
        --from-literal=aws-secret-access-key="${AWS_SECRET_ACCESS_KEY:-}" \
        --from-literal=gcp-service-account-key="${GCP_SERVICE_ACCOUNT_KEY:-}" \
        --from-literal=google-client-secret="${GOOGLE_CLIENT_SECRET:-}" \
        --from-literal=facebook-app-secret="${FACEBOOK_APP_SECRET:-}" \
        --from-literal=apple-private-key="${APPLE_PRIVATE_KEY:-}" \
        --dry-run=client -o yaml | kubectl apply -f -
    
    print_success "External service secrets created"
}

# Function to create monitoring secrets
create_monitoring_secrets() {
    print_info "Creating monitoring secrets..."
    
    kubectl create secret generic monitoring-secrets \
        --namespace="$NAMESPACE" \
        --from-literal=datadog-api-key="${DATADOG_API_KEY:-}" \
        --from-literal=newrelic-license-key="${NEWRELIC_LICENSE_KEY:-}" \
        --from-literal=sentry-dsn="${SENTRY_DSN:-}" \
        --from-literal=elasticsearch-username="${ELASTICSEARCH_USERNAME:-elastic}" \
        --from-literal=elasticsearch-password="${ELASTICSEARCH_PASSWORD:-}" \
        --dry-run=client -o yaml | kubectl apply -f -
    
    print_success "Monitoring secrets created"
}

# Function to create TLS secrets
create_tls_secrets() {
    print_info "Creating TLS secrets..."
    
    if [[ "$ENVIRONMENT" == "development" ]]; then
        print_info "Skipping TLS secrets for development environment"
        return 0
    fi
    
    # Check if cert-manager is available
    if kubectl get crd certificates.cert-manager.io &> /dev/null; then
        print_info "cert-manager detected. TLS certificates will be managed automatically."
        return 0
    fi
    
    # Manual TLS certificate creation (if certificates are provided)
    if [[ -n "${TLS_CERT:-}" && -n "${TLS_KEY:-}" ]]; then
        kubectl create secret tls soulmatting-production-tls \
            --namespace="$NAMESPACE" \
            --cert="$TLS_CERT" \
            --key="$TLS_KEY" \
            --dry-run=client -o yaml | kubectl apply -f -
        
        print_success "TLS secrets created"
    else
        print_warning "TLS certificate files not provided. Please configure cert-manager or provide certificate files."
    fi
}

# Function to validate secrets
validate_secrets() {
    print_info "Validating secrets..."
    
    local secrets=(
        "app-secrets"
        "postgresql-secret"
        "redis-secret"
        "elasticsearch-secret"
        "ghcr-secret"
        "external-service-secrets"
        "monitoring-secrets"
    )
    
    local missing_secrets=()
    
    for secret in "${secrets[@]}"; do
        if kubectl get secret "$secret" --namespace="$NAMESPACE" &> /dev/null; then
            print_success "Secret '$secret' exists"
        else
            print_error "Secret '$secret' is missing"
            missing_secrets+=("$secret")
        fi
    done
    
    if [[ ${#missing_secrets[@]} -eq 0 ]]; then
        print_success "All secrets are present"
        return 0
    else
        print_error "Missing secrets: ${missing_secrets[*]}"
        return 1
    fi
}

# Function to delete all secrets
delete_all_secrets() {
    print_warning "This will delete all SoulMatting secrets in namespace '$NAMESPACE'"
    read -p "Are you sure? (y/N): " -n 1 -r
    echo
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_info "Deleting all secrets..."
        
        kubectl delete secret app-secrets --namespace="$NAMESPACE" --ignore-not-found=true
        kubectl delete secret postgresql-secret --namespace="$NAMESPACE" --ignore-not-found=true
        kubectl delete secret redis-secret --namespace="$NAMESPACE" --ignore-not-found=true
        kubectl delete secret elasticsearch-secret --namespace="$NAMESPACE" --ignore-not-found=true
        kubectl delete secret ghcr-secret --namespace="$NAMESPACE" --ignore-not-found=true
        kubectl delete secret external-service-secrets --namespace="$NAMESPACE" --ignore-not-found=true
        kubectl delete secret monitoring-secrets --namespace="$NAMESPACE" --ignore-not-found=true
        kubectl delete secret soulmatting-production-tls --namespace="$NAMESPACE" --ignore-not-found=true
        kubectl delete secret api-production-tls --namespace="$NAMESPACE" --ignore-not-found=true
        kubectl delete secret ws-production-tls --namespace="$NAMESPACE" --ignore-not-found=true
        
        print_success "All secrets deleted"
    else
        print_info "Operation cancelled"
    fi
}

# Function to backup secrets
backup_secrets() {
    local backup_file="secrets-backup-$(date +%Y%m%d-%H%M%S).yaml"
    print_info "Backing up secrets to $backup_file..."
    
    kubectl get secrets --namespace="$NAMESPACE" -o yaml > "$backup_file"
    
    print_success "Secrets backed up to $backup_file"
}

# Function to restore secrets
restore_secrets() {
    local backup_file="$1"
    
    if [[ ! -f "$backup_file" ]]; then
        print_error "Backup file '$backup_file' not found"
        return 1
    fi
    
    print_info "Restoring secrets from $backup_file..."
    
    kubectl apply -f "$backup_file"
    
    print_success "Secrets restored from $backup_file"
}

# Function to generate passwords and save to .env file
generate_passwords() {
    print_info "Generating random passwords..."
    
    cat > "generated-passwords.env" << EOF
# Generated passwords for SoulMatting platform
# Generated on: $(date)
# Environment: $ENVIRONMENT

# Application secrets
JWT_SECRET=$(generate_password 64)
ENCRYPTION_KEY=$(generate_password 32)
API_KEY=$(generate_password 32)
WEBHOOK_SECRET=$(generate_password 32)

# Database secrets
POSTGRES_PASSWORD=$(generate_password 32)
POSTGRES_REPLICATION_PASSWORD=$(generate_password 32)

# Redis secrets
REDIS_PASSWORD=$(generate_password 32)

# Elasticsearch secrets
ELASTIC_PASSWORD=$(generate_password 32)

# Add your external service credentials here:
# GITHUB_TOKEN=your_github_token
# STRIPE_SECRET_KEY=your_stripe_secret_key
# SENDGRID_API_KEY=your_sendgrid_api_key
# etc.
EOF
    
    print_success "Passwords generated and saved to generated-passwords.env"
    print_warning "Please review and update the file with your actual service credentials"
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -n|--namespace)
            NAMESPACE="$2"
            shift 2
            ;;
        -e|--environment)
            ENVIRONMENT="$2"
            shift 2
            ;;
        -f|--env-file)
            ENV_FILE="$2"
            shift 2
            ;;
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        -v|--verbose)
            VERBOSE=true
            shift
            ;;
        -h|--help|help)
            show_usage
            exit 0
            ;;
        create-all)
            COMMAND="create-all"
            shift
            ;;
        create-app)
            COMMAND="create-app"
            shift
            ;;
        create-db)
            COMMAND="create-db"
            shift
            ;;
        create-redis)
            COMMAND="create-redis"
            shift
            ;;
        create-elastic)
            COMMAND="create-elastic"
            shift
            ;;
        create-registry)
            COMMAND="create-registry"
            shift
            ;;
        create-external)
            COMMAND="create-external"
            shift
            ;;
        create-monitoring)
            COMMAND="create-monitoring"
            shift
            ;;
        create-tls)
            COMMAND="create-tls"
            shift
            ;;
        validate)
            COMMAND="validate"
            shift
            ;;
        delete-all)
            COMMAND="delete-all"
            shift
            ;;
        backup)
            COMMAND="backup"
            shift
            ;;
        restore)
            COMMAND="restore"
            BACKUP_FILE="$2"
            shift 2
            ;;
        generate-passwords)
            COMMAND="generate-passwords"
            shift
            ;;
        *)
            print_error "Unknown option: $1"
            show_usage
            exit 1
            ;;
    esac
done

# Check if command is provided
if [[ -z "${COMMAND:-}" ]]; then
    print_error "No command specified"
    show_usage
    exit 1
fi

# Main execution
main() {
    print_info "SoulMatting Secrets Management"
    print_info "Environment: $ENVIRONMENT"
    print_info "Namespace: $NAMESPACE"
    
    # Load environment variables
    load_env_vars
    
    # Check prerequisites for most commands
    if [[ "$COMMAND" != "generate-passwords" ]]; then
        check_prerequisites
    fi
    
    # Execute command
    case "$COMMAND" in
        create-all)
            create_app_secrets
            create_db_secrets
            create_redis_secrets
            create_elastic_secrets
            create_registry_secrets
            create_external_secrets
            create_monitoring_secrets
            create_tls_secrets
            ;;
        create-app)
            create_app_secrets
            ;;
        create-db)
            create_db_secrets
            ;;
        create-redis)
            create_redis_secrets
            ;;
        create-elastic)
            create_elastic_secrets
            ;;
        create-registry)
            create_registry_secrets
            ;;
        create-external)
            create_external_secrets
            ;;
        create-monitoring)
            create_monitoring_secrets
            ;;
        create-tls)
            create_tls_secrets
            ;;
        validate)
            validate_secrets
            ;;
        delete-all)
            delete_all_secrets
            ;;
        backup)
            backup_secrets
            ;;
        restore)
            restore_secrets "$BACKUP_FILE"
            ;;
        generate-passwords)
            generate_passwords
            ;;
    esac
    
    print_success "Operation completed successfully"
}

# Run main function
main