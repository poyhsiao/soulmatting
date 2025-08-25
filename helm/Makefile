# SoulMatting Platform Helm Makefile
# Author: Kim Hsiao
# Version: 1.0.0
# Created: 2024-01-20
# Last Updated: 2024-01-20

# Default values
NAMESPACE ?= soulmatting
RELEASE_NAME ?= soulmatting
ENVIRONMENT ?= development
CHART_PATH ?= ./soulmatting
VALUES_FILE ?=

# Colors
RED := \033[0;31m
GREEN := \033[0;32m
YELLOW := \033[1;33m
BLUE := \033[0;34m
NC := \033[0m

.PHONY: help install upgrade uninstall status logs clean lint test dry-run dev staging prod

# Default target
help: ## Show this help message
	@echo "SoulMatting Platform Helm Makefile"
	@echo ""
	@echo "Usage: make [target] [VARIABLE=value]"
	@echo ""
	@echo "Variables:"
	@echo "  NAMESPACE      Kubernetes namespace (default: soulmatting)"
	@echo "  RELEASE_NAME   Helm release name (default: soulmatting)"
	@echo "  ENVIRONMENT    Environment (development|staging|production) (default: development)"
	@echo "  VALUES_FILE    Custom values file"
	@echo ""
	@echo "Targets:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}'
	@echo ""
	@echo "Examples:"
	@echo "  make dev                    # Install in development environment"
	@echo "  make prod VALUES_FILE=prod.yaml  # Install in production with custom values"
	@echo "  make upgrade                # Upgrade existing deployment"
	@echo "  make status                 # Check deployment status"
	@echo "  make clean                  # Uninstall and clean up"

# Prerequisites check
check-prereqs: ## Check prerequisites
	@echo "$(BLUE)[INFO]$(NC) Checking prerequisites..."
	@command -v kubectl >/dev/null 2>&1 || { echo "$(RED)[ERROR]$(NC) kubectl is required but not installed."; exit 1; }
	@command -v helm >/dev/null 2>&1 || { echo "$(RED)[ERROR]$(NC) helm is required but not installed."; exit 1; }
	@kubectl cluster-info >/dev/null 2>&1 || { echo "$(RED)[ERROR]$(NC) Cannot connect to Kubernetes cluster."; exit 1; }
	@echo "$(GREEN)[SUCCESS]$(NC) Prerequisites check passed"

# Setup Helm repositories
setup-repos: ## Setup Helm repositories
	@echo "$(BLUE)[INFO]$(NC) Setting up Helm repositories..."
	@helm repo add bitnami https://charts.bitnami.com/bitnami
	@helm repo update
	@echo "$(GREEN)[SUCCESS]$(NC) Helm repositories updated"

# Update chart dependencies
update-deps: ## Update chart dependencies
	@echo "$(BLUE)[INFO]$(NC) Updating chart dependencies..."
	@cd $(CHART_PATH) && helm dependency update
	@echo "$(GREEN)[SUCCESS]$(NC) Chart dependencies updated"

# Lint chart
lint: ## Lint Helm chart
	@echo "$(BLUE)[INFO]$(NC) Linting Helm chart..."
	@helm lint $(CHART_PATH)
	@echo "$(GREEN)[SUCCESS]$(NC) Chart linting passed"

# Template chart
template: ## Generate Kubernetes manifests
	@echo "$(BLUE)[INFO]$(NC) Generating Kubernetes manifests..."
	@helm template $(RELEASE_NAME) $(CHART_PATH) \
		--namespace $(NAMESPACE) \
		--set global.environment=$(ENVIRONMENT) \
		$(if $(VALUES_FILE),--values $(VALUES_FILE),)

# Dry run
dry-run: check-prereqs setup-repos update-deps lint ## Perform dry run installation
	@echo "$(BLUE)[INFO]$(NC) Performing dry run..."
	@helm install $(RELEASE_NAME) $(CHART_PATH) \
		--namespace $(NAMESPACE) \
		--create-namespace \
		--set global.environment=$(ENVIRONMENT) \
		$(if $(VALUES_FILE),--values $(VALUES_FILE),) \
		--dry-run
	@echo "$(GREEN)[SUCCESS]$(NC) Dry run completed"

# Install
install: check-prereqs setup-repos update-deps lint ## Install SoulMatting Platform
	@echo "$(BLUE)[INFO]$(NC) Installing SoulMatting Platform..."
	@helm install $(RELEASE_NAME) $(CHART_PATH) \
		--namespace $(NAMESPACE) \
		--create-namespace \
		--set global.environment=$(ENVIRONMENT) \
		$(if $(VALUES_FILE),--values $(VALUES_FILE),) \
		$(call environment-settings,$(ENVIRONMENT))
	@echo "$(GREEN)[SUCCESS]$(NC) SoulMatting Platform installed successfully"
	@$(MAKE) status

# Upgrade
upgrade: check-prereqs update-deps lint ## Upgrade SoulMatting Platform
	@echo "$(BLUE)[INFO]$(NC) Upgrading SoulMatting Platform..."
	@helm upgrade $(RELEASE_NAME) $(CHART_PATH) \
		--namespace $(NAMESPACE) \
		--set global.environment=$(ENVIRONMENT) \
		$(if $(VALUES_FILE),--values $(VALUES_FILE),) \
		$(call environment-settings,$(ENVIRONMENT))
	@echo "$(GREEN)[SUCCESS]$(NC) SoulMatting Platform upgraded successfully"
	@$(MAKE) status

# Uninstall
uninstall: ## Uninstall SoulMatting Platform
	@echo "$(BLUE)[INFO]$(NC) Uninstalling SoulMatting Platform..."
	@helm uninstall $(RELEASE_NAME) --namespace $(NAMESPACE)
	@echo "$(GREEN)[SUCCESS]$(NC) SoulMatting Platform uninstalled successfully"

# Status
status: ## Show deployment status
	@echo "$(BLUE)[INFO]$(NC) Checking deployment status..."
	@echo "\n$(YELLOW)Helm Release Status:$(NC)"
	@helm status $(RELEASE_NAME) --namespace $(NAMESPACE) || echo "$(RED)[ERROR]$(NC) Release not found"
	@echo "\n$(YELLOW)Pod Status:$(NC)"
	@kubectl get pods --namespace $(NAMESPACE) || echo "$(RED)[ERROR]$(NC) Namespace not found"
	@echo "\n$(YELLOW)Service Status:$(NC)"
	@kubectl get svc --namespace $(NAMESPACE) || echo "$(RED)[ERROR]$(NC) Namespace not found"
	@echo "\n$(YELLOW)Ingress Status:$(NC)"
	@kubectl get ingress --namespace $(NAMESPACE) 2>/dev/null || echo "$(YELLOW)[WARNING]$(NC) No ingress resources found"

# Logs
logs: ## Show logs for all services
	@echo "$(BLUE)[INFO]$(NC) Showing logs for SoulMatting services..."
	@kubectl logs -l app.kubernetes.io/instance=$(RELEASE_NAME) --namespace $(NAMESPACE) --tail=100

# Port forward web service
port-forward: ## Port forward web service to localhost:3000
	@echo "$(BLUE)[INFO]$(NC) Port forwarding web service to localhost:3000..."
	@kubectl port-forward svc/$(RELEASE_NAME)-web 3000:3000 --namespace $(NAMESPACE)

# Clean up
clean: uninstall ## Uninstall and clean up resources
	@echo "$(BLUE)[INFO]$(NC) Cleaning up resources..."
	@kubectl delete namespace $(NAMESPACE) --ignore-not-found=true
	@echo "$(GREEN)[SUCCESS]$(NC) Cleanup completed"

# Test
test: ## Run tests
	@echo "$(BLUE)[INFO]$(NC) Running tests..."
	@helm test $(RELEASE_NAME) --namespace $(NAMESPACE)
	@echo "$(GREEN)[SUCCESS]$(NC) Tests completed"

# Environment-specific targets
dev: ENVIRONMENT=development ## Install in development environment
dev: install
	@echo "\n$(GREEN)[SUCCESS]$(NC) Development environment deployed"
	@echo "\n$(YELLOW)Access URLs:$(NC)"
	@echo "Web Application: http://soulmatting.local"
	@echo "Auth Service: http://auth.soulmatting.local"
	@echo "\nAdd these entries to your /etc/hosts file:"
	@echo "127.0.0.1 soulmatting.local auth.soulmatting.local user.soulmatting.local"

staging: ENVIRONMENT=staging ## Install in staging environment
staging: install
	@echo "\n$(GREEN)[SUCCESS]$(NC) Staging environment deployed"
	@echo "\n$(YELLOW)Access URLs:$(NC)"
	@echo "Web Application: https://staging.soulmatting.com"
	@echo "Auth Service: https://auth.staging.soulmatting.com"

prod: ENVIRONMENT=production ## Install in production environment
prod: install
	@echo "\n$(GREEN)[SUCCESS]$(NC) Production environment deployed"
	@echo "\n$(YELLOW)Access URLs:$(NC)"
	@echo "Web Application: https://soulmatting.com"
	@echo "Auth Service: https://auth.soulmatting.com"

# Debug
debug: ## Install with debug enabled
	@$(MAKE) install VALUES_FILE=values-debug.yaml

# Rollback
rollback: ## Rollback to previous release
	@echo "$(BLUE)[INFO]$(NC) Rolling back to previous release..."
	@helm rollback $(RELEASE_NAME) --namespace $(NAMESPACE)
	@echo "$(GREEN)[SUCCESS]$(NC) Rollback completed"
	@$(MAKE) status

# History
history: ## Show release history
	@echo "$(BLUE)[INFO]$(NC) Release history:"
	@helm history $(RELEASE_NAME) --namespace $(NAMESPACE)

# Get values
get-values: ## Get current values
	@echo "$(BLUE)[INFO]$(NC) Current values:"
	@helm get values $(RELEASE_NAME) --namespace $(NAMESPACE)

# Get manifest
get-manifest: ## Get current manifest
	@echo "$(BLUE)[INFO]$(NC) Current manifest:"
	@helm get manifest $(RELEASE_NAME) --namespace $(NAMESPACE)

# Environment-specific settings function
define environment-settings
$(if $(filter development,$1),--set postgresql.primary.persistence.enabled=false --set redis.master.persistence.enabled=false --set elasticsearch.master.persistence.enabled=false --set global.domain=soulmatting.local)
$(if $(filter staging,$1),--set postgresql.primary.persistence.enabled=true --set redis.master.persistence.enabled=true --set elasticsearch.master.persistence.enabled=true --set global.domain=staging.soulmatting.com)
$(if $(filter production,$1),--set postgresql.primary.persistence.enabled=true --set redis.master.persistence.enabled=true --set elasticsearch.master.persistence.enabled=true --set global.domain=soulmatting.com)
endef

# Watch pods
watch: ## Watch pod status
	@echo "$(BLUE)[INFO]$(NC) Watching pod status (Ctrl+C to exit)..."
	@watch kubectl get pods --namespace $(NAMESPACE)

# Describe failed pods
describe-failed: ## Describe failed pods
	@echo "$(BLUE)[INFO]$(NC) Describing failed pods..."
	@kubectl get pods --namespace $(NAMESPACE) --field-selector=status.phase=Failed -o name | xargs -I {} kubectl describe {} --namespace $(NAMESPACE)

# Get events
events: ## Get namespace events
	@echo "$(BLUE)[INFO]$(NC) Recent events:"
	@kubectl get events --namespace $(NAMESPACE) --sort-by='.lastTimestamp'

# Scale services
scale-auth: ## Scale auth service (usage: make scale-auth REPLICAS=3)
	@kubectl scale deployment $(RELEASE_NAME)-auth --replicas=$(REPLICAS) --namespace $(NAMESPACE)

scale-user: ## Scale user service (usage: make scale-user REPLICAS=3)
	@kubectl scale deployment $(RELEASE_NAME)-user --replicas=$(REPLICAS) --namespace $(NAMESPACE)

scale-all: ## Scale all services (usage: make scale-all REPLICAS=3)
	@for service in auth user match communication media notification search payment analytics; do \
		kubectl scale deployment $(RELEASE_NAME)-$$service --replicas=$(REPLICAS) --namespace $(NAMESPACE) || true; \
	done

# Backup
backup-db: ## Backup PostgreSQL database
	@echo "$(BLUE)[INFO]$(NC) Backing up PostgreSQL database..."
	@kubectl exec -it $(shell kubectl get pods --namespace $(NAMESPACE) -l app.kubernetes.io/name=postgresql -o jsonpath='{.items[0].metadata.name}') --namespace $(NAMESPACE) -- pg_dump -U postgres soulmatting > backup-$(shell date +%Y%m%d-%H%M%S).sql
	@echo "$(GREEN)[SUCCESS]$(NC) Database backup completed"

# Restore
restore-db: ## Restore PostgreSQL database (usage: make restore-db BACKUP_FILE=backup.sql)
	@echo "$(BLUE)[INFO]$(NC) Restoring PostgreSQL database..."
	@kubectl exec -i $(shell kubectl get pods --namespace $(NAMESPACE) -l app.kubernetes.io/name=postgresql -o jsonpath='{.items[0].metadata.name}') --namespace $(NAMESPACE) -- psql -U postgres soulmatting < $(BACKUP_FILE)
	@echo "$(GREEN)[SUCCESS]$(NC) Database restore completed"