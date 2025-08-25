#!/bin/bash

# SoulMatting Platform Deployment Script
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

# Default values
NAMESPACE="soulmatting"
RELEASE_NAME="soulmatting"
ENVIRONMENT="development"
CHART_PATH="./soulmatting"
VALUES_FILE=""
DRY_RUN=false
UPGRADE=false
UNINSTALL=false
DEBUG=false

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
SoulMatting Platform Deployment Script

Usage: $0 [OPTIONS]

Options:
    -n, --namespace NAMESPACE       Kubernetes namespace (default: soulmatting)
    -r, --release RELEASE_NAME      Helm release name (default: soulmatting)
    -e, --environment ENVIRONMENT   Environment (development|staging|production) (default: development)
    -f, --values-file FILE          Custom values file
    -u, --upgrade                   Upgrade existing release
    --uninstall                     Uninstall the release
    --dry-run                       Perform a dry run
    --debug                         Enable debug mode
    -h, --help                      Show this help message

Examples:
    # Install in development environment
    $0 -e development
    
    # Install in production with custom values
    $0 -e production -f values-prod.yaml
    
    # Upgrade existing deployment
    $0 --upgrade
    
    # Dry run for testing
    $0 --dry-run
    
    # Uninstall
    $0 --uninstall

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
    
    # Check if helm is installed
    if ! command -v helm &> /dev/null; then
        print_error "helm is not installed or not in PATH"
        exit 1
    fi
    
    # Check if kubectl can connect to cluster
    if ! kubectl cluster-info &> /dev/null; then
        print_error "Cannot connect to Kubernetes cluster"
        exit 1
    fi
    
    print_success "Prerequisites check passed"
}

# Function to setup Helm repositories
setup_helm_repos() {
    print_info "Setting up Helm repositories..."
    
    # Add Bitnami repository
    helm repo add bitnami https://charts.bitnami.com/bitnami
    
    # Update repositories
    helm repo update
    
    print_success "Helm repositories updated"
}

# Function to create namespace
create_namespace() {
    print_info "Creating namespace: $NAMESPACE"
    
    if kubectl get namespace "$NAMESPACE" &> /dev/null; then
        print_warning "Namespace $NAMESPACE already exists"
    else
        kubectl create namespace "$NAMESPACE"
        print_success "Namespace $NAMESPACE created"
    fi
}

# Function to update chart dependencies
update_dependencies() {
    print_info "Updating chart dependencies..."
    
    cd "$CHART_PATH"
    helm dependency update
    cd - > /dev/null
    
    print_success "Chart dependencies updated"
}

# Function to validate chart
validate_chart() {
    print_info "Validating Helm chart..."
    
    # Lint the chart
    if helm lint "$CHART_PATH"; then
        print_success "Chart validation passed"
    else
        print_error "Chart validation failed"
        exit 1
    fi
}

# Function to build Helm command
build_helm_command() {
    local cmd="helm"
    
    if [ "$UNINSTALL" = true ]; then
        cmd="$cmd uninstall $RELEASE_NAME"
        if [ "$NAMESPACE" != "default" ]; then
            cmd="$cmd --namespace $NAMESPACE"
        fi
    elif [ "$UPGRADE" = true ]; then
        cmd="$cmd upgrade $RELEASE_NAME $CHART_PATH"
    else
        cmd="$cmd install $RELEASE_NAME $CHART_PATH"
    fi
    
    if [ "$UNINSTALL" != true ]; then
        # Add namespace
        if [ "$NAMESPACE" != "default" ]; then
            cmd="$cmd --namespace $NAMESPACE"
        fi
        
        # Add environment-specific settings
        cmd="$cmd --set global.environment=$ENVIRONMENT"
        
        case $ENVIRONMENT in
            "development")
                cmd="$cmd --set global.domain=soulmatting.local"
                cmd="$cmd --set postgresql.primary.persistence.enabled=false"
                cmd="$cmd --set redis.master.persistence.enabled=false"
                cmd="$cmd --set elasticsearch.master.persistence.enabled=false"
                ;;
            "staging")
                cmd="$cmd --set global.domain=staging.soulmatting.com"
                cmd="$cmd --set postgresql.primary.persistence.enabled=true"
                cmd="$cmd --set redis.master.persistence.enabled=true"
                cmd="$cmd --set elasticsearch.master.persistence.enabled=true"
                ;;
            "production")
                cmd="$cmd --set global.domain=soulmatting.com"
                cmd="$cmd --set postgresql.primary.persistence.enabled=true"
                cmd="$cmd --set redis.master.persistence.enabled=true"
                cmd="$cmd --set elasticsearch.master.persistence.enabled=true"
                ;;
        esac
        
        # Add custom values file
        if [ -n "$VALUES_FILE" ]; then
            cmd="$cmd --values $VALUES_FILE"
        fi
        
        # Add dry run flag
        if [ "$DRY_RUN" = true ]; then
            cmd="$cmd --dry-run"
        fi
        
        # Add debug flag
        if [ "$DEBUG" = true ]; then
            cmd="$cmd --debug"
        fi
        
        # Create namespace if installing
        if [ "$UPGRADE" != true ]; then
            cmd="$cmd --create-namespace"
        fi
    fi
    
    echo "$cmd"
}

# Function to deploy
deploy() {
    local helm_cmd
    helm_cmd=$(build_helm_command)
    
    if [ "$UNINSTALL" = true ]; then
        print_info "Uninstalling SoulMatting Platform..."
    elif [ "$UPGRADE" = true ]; then
        print_info "Upgrading SoulMatting Platform..."
    else
        print_info "Installing SoulMatting Platform..."
    fi
    
    print_info "Executing: $helm_cmd"
    
    if eval "$helm_cmd"; then
        if [ "$UNINSTALL" = true ]; then
            print_success "SoulMatting Platform uninstalled successfully"
        elif [ "$DRY_RUN" = true ]; then
            print_success "Dry run completed successfully"
        else
            print_success "SoulMatting Platform deployed successfully"
        fi
    else
        print_error "Deployment failed"
        exit 1
    fi
}

# Function to show deployment status
show_status() {
    if [ "$UNINSTALL" = true ] || [ "$DRY_RUN" = true ]; then
        return
    fi
    
    print_info "Checking deployment status..."
    
    # Show Helm release status
    helm status "$RELEASE_NAME" --namespace "$NAMESPACE"
    
    # Show pods status
    print_info "Pod status:"
    kubectl get pods --namespace "$NAMESPACE"
    
    # Show services
    print_info "Service status:"
    kubectl get svc --namespace "$NAMESPACE"
    
    # Show ingress
    print_info "Ingress status:"
    kubectl get ingress --namespace "$NAMESPACE" 2>/dev/null || print_warning "No ingress resources found"
}

# Function to show access information
show_access_info() {
    if [ "$UNINSTALL" = true ] || [ "$DRY_RUN" = true ]; then
        return
    fi
    
    print_info "Access Information:"
    
    case $ENVIRONMENT in
        "development")
            echo "Web Application: http://soulmatting.local"
            echo "Auth Service: http://auth.soulmatting.local"
            echo "User Service: http://user.soulmatting.local"
            echo ""
            echo "Add these entries to your /etc/hosts file:"
            echo "127.0.0.1 soulmatting.local"
            echo "127.0.0.1 auth.soulmatting.local"
            echo "127.0.0.1 user.soulmatting.local"
            echo "# ... add other services as needed"
            ;;
        "staging")
            echo "Web Application: https://staging.soulmatting.com"
            echo "Auth Service: https://auth.staging.soulmatting.com"
            ;;
        "production")
            echo "Web Application: https://soulmatting.com"
            echo "Auth Service: https://auth.soulmatting.com"
            ;;
    esac
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -n|--namespace)
            NAMESPACE="$2"
            shift 2
            ;;
        -r|--release)
            RELEASE_NAME="$2"
            shift 2
            ;;
        -e|--environment)
            ENVIRONMENT="$2"
            shift 2
            ;;
        -f|--values-file)
            VALUES_FILE="$2"
            shift 2
            ;;
        -u|--upgrade)
            UPGRADE=true
            shift
            ;;
        --uninstall)
            UNINSTALL=true
            shift
            ;;
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        --debug)
            DEBUG=true
            shift
            ;;
        -h|--help)
            show_usage
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            show_usage
            exit 1
            ;;
    esac
done

# Validate environment
if [[ ! "$ENVIRONMENT" =~ ^(development|staging|production)$ ]]; then
    print_error "Invalid environment: $ENVIRONMENT. Must be one of: development, staging, production"
    exit 1
fi

# Validate values file if provided
if [ -n "$VALUES_FILE" ] && [ ! -f "$VALUES_FILE" ]; then
    print_error "Values file not found: $VALUES_FILE"
    exit 1
fi

# Main execution
print_info "SoulMatting Platform Deployment Script"
print_info "Environment: $ENVIRONMENT"
print_info "Namespace: $NAMESPACE"
print_info "Release: $RELEASE_NAME"

if [ -n "$VALUES_FILE" ]; then
    print_info "Values file: $VALUES_FILE"
fi

echo ""

# Execute deployment steps
check_prerequisites

if [ "$UNINSTALL" != true ]; then
    setup_helm_repos
    update_dependencies
    validate_chart
fi

deploy
show_status
show_access_info

print_success "Deployment script completed!"