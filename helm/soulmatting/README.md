# SoulMatting Platform Helm Chart

**Author:** Kim Hsiao  
**Version:** 1.0.0  
**Created:** 2024-01-20  
**Last Updated:** 2024-01-20

## Overview

This is an umbrella Helm chart for the SoulMatting Platform, a comprehensive microservices-based
dating application. It manages the deployment of all microservices and their dependencies in a
Kubernetes cluster.

## Architecture

The SoulMatting Platform consists of:

### Frontend

- **Web Application**: React-based frontend application

### Backend Microservices

- **Auth Service**: Authentication and authorization
- **User Service**: User profile management
- **Match Service**: Matching algorithm and recommendations
- **Communication Service**: Real-time messaging and chat
- **Media Service**: Photo and video management
- **Notification Service**: Push notifications and alerts
- **Search Service**: User search and filtering
- **Payment Service**: Subscription and payment processing
- **Analytics Service**: User behavior analytics

### Infrastructure

- **PostgreSQL**: Primary database
- **Redis**: Caching and session storage
- **Elasticsearch**: Search indexing and analytics

## Prerequisites

- Kubernetes cluster (v1.20+)
- Helm 3.x
- kubectl configured to access your cluster

## Installation

### 1. Add Bitnami Repository

```bash
helm repo add bitnami https://charts.bitnami.com/bitnami
helm repo update
```

### 2. Install the Chart

```bash
# Install with default values
helm install soulmatting ./helm/soulmatting

# Install with custom values
helm install soulmatting ./helm/soulmatting -f custom-values.yaml

# Install in specific namespace
kubectl create namespace soulmatting
helm install soulmatting ./helm/soulmatting -n soulmatting
```

### 3. Verify Installation

```bash
# Check deployment status
kubectl get pods -n soulmatting

# Check services
kubectl get svc -n soulmatting

# Check ingress
kubectl get ingress -n soulmatting
```

## Configuration

### Global Configuration

The chart supports global configuration that applies to all services:

```yaml
global:
  imageRegistry: ghcr.io
  environment: development
  domain: soulmatting.local
  tls:
    enabled: true
    secretName: soulmatting-tls
  database:
    host: postgresql
    port: 5432
    username: postgres
    password: postgres
  redis:
    host: redis-master
    port: 6379
  elasticsearch:
    host: elasticsearch
    port: 9200
```

### Service-Specific Configuration

Each service can be individually configured:

```yaml
# Enable/disable services
web:
  enabled: true
auth:
  enabled: true
user:
  enabled: true
# ... other services

# Infrastructure components
redis:
  enabled: true
postgresql:
  enabled: true
elasticsearch:
  enabled: true
```

### Resource Configuration

```yaml
auth:
  resources:
    limits:
      cpu: 500m
      memory: 512Mi
    requests:
      cpu: 250m
      memory: 256Mi
```

### Ingress Configuration

```yaml
auth:
  ingress:
    enabled: true
    hosts:
      - host: auth.soulmatting.local
        paths:
          - path: /
            pathType: Prefix
```

## Environment-Specific Deployments

### Development

```bash
helm install soulmatting ./helm/soulmatting \
  --set global.environment=development \
  --set global.domain=soulmatting.local \
  --set postgresql.primary.persistence.enabled=false \
  --set redis.master.persistence.enabled=false
```

### Staging

```bash
helm install soulmatting ./helm/soulmatting \
  --set global.environment=staging \
  --set global.domain=staging.soulmatting.com \
  --set postgresql.primary.persistence.enabled=true \
  --set redis.master.persistence.enabled=true
```

### Production

```bash
helm install soulmatting ./helm/soulmatting \
  --set global.environment=production \
  --set global.domain=soulmatting.com \
  --set postgresql.primary.persistence.enabled=true \
  --set redis.master.persistence.enabled=true \
  --set elasticsearch.master.persistence.enabled=true
```

## Scaling

### Horizontal Pod Autoscaling

Each service supports HPA:

```yaml
auth:
  autoscaling:
    enabled: true
    minReplicas: 2
    maxReplicas: 10
    targetCPUUtilizationPercentage: 70
```

### Manual Scaling

```bash
# Scale specific service
kubectl scale deployment soulmatting-auth --replicas=3

# Scale via Helm upgrade
helm upgrade soulmatting ./helm/soulmatting \
  --set auth.replicaCount=3
```

## Monitoring and Observability

### Health Checks

All services include health check endpoints:

- Liveness probe: `/health`
- Readiness probe: `/ready`

### Metrics

Services expose Prometheus metrics on `/metrics` endpoint.

### Logging

All services log to stdout in JSON format for centralized logging.

## Security

### TLS Configuration

```yaml
global:
  tls:
    enabled: true
    secretName: soulmatting-tls
```

### Network Policies

Network policies are enabled by default to restrict inter-service communication.

### Pod Security

All pods run with security contexts:

- Non-root user
- Read-only root filesystem
- Dropped capabilities

## Troubleshooting

### Common Issues

1. **Pods not starting**

   ```bash
   kubectl describe pod <pod-name>
   kubectl logs <pod-name>
   ```

2. **Service connectivity issues**

   ```bash
   kubectl get svc
   kubectl get endpoints
   ```

3. **Ingress not working**
   ```bash
   kubectl get ingress
   kubectl describe ingress <ingress-name>
   ```

### Debug Mode

Enable debug logging:

```bash
helm upgrade soulmatting ./helm/soulmatting \
  --set global.debug=true
```

## Backup and Recovery

### Database Backup

```bash
# PostgreSQL backup
kubectl exec -it postgresql-0 -- pg_dump -U postgres soulmatting > backup.sql

# Redis backup
kubectl exec -it redis-master-0 -- redis-cli BGSAVE
```

### Restore

```bash
# PostgreSQL restore
kubectl exec -i postgresql-0 -- psql -U postgres soulmatting < backup.sql
```

## Upgrading

```bash
# Update dependencies
helm dependency update ./helm/soulmatting

# Upgrade deployment
helm upgrade soulmatting ./helm/soulmatting

# Upgrade with new values
helm upgrade soulmatting ./helm/soulmatting -f new-values.yaml
```

## Uninstalling

```bash
# Uninstall the chart
helm uninstall soulmatting

# Clean up persistent volumes (if needed)
kubectl delete pvc --all
```

## Development

### Local Development

For local development with minikube or kind:

```bash
# Enable ingress addon (minikube)
minikube addons enable ingress

# Install with local values
helm install soulmatting ./helm/soulmatting -f values-local.yaml

# Port forward for testing
kubectl port-forward svc/soulmatting-web 3000:3000
```

### Testing

```bash
# Lint the chart
helm lint ./helm/soulmatting

# Template rendering
helm template soulmatting ./helm/soulmatting

# Dry run
helm install soulmatting ./helm/soulmatting --dry-run
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test the changes
5. Submit a pull request

## Support

For support and questions:

- GitHub Issues:
  [https://github.com/kimhsiao/soulmatting/issues](https://github.com/kimhsiao/soulmatting/issues)
- Email: kim@soulmatting.com

## License

This project is licensed under the MIT License - see the LICENSE file for details.
