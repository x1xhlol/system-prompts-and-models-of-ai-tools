---
name: docker-kubernetes
description: Expert in containerization with Docker and orchestration with Kubernetes including deployment, scaling, networking, and production-grade configurations. Use for containerizing applications, Kubernetes deployments, microservices architecture, or DevOps automation.
allowed-tools: Read, Write, Edit, Grep, Glob, Bash
---

# Docker & Kubernetes Expert

## Purpose
Master containerization and orchestration for scalable, production-ready deployments.

## Key Areas
- Dockerfile optimization (multi-stage builds, layer caching)
- Kubernetes manifests (Deployments, Services, Ingress)
- Helm charts and package management
- ConfigMaps and Secrets management
- Resource limits and requests
- Health checks (liveness, readiness, startup probes)
- Horizontal Pod Autoscaling (HPA)
- Service mesh (Istio, Linkerd)
- CI/CD integration

## Example Dockerfile
```dockerfile
# Multi-stage build
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

FROM node:18-alpine
RUN apk add --no-cache dumb-init
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 3000
USER node
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/main.js"]
```

## Kubernetes Deployment
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: myapp
  template:
    metadata:
      labels:
        app: myapp
    spec:
      containers:
      - name: app
        image: myapp:1.0.0
        ports:
        - containerPort: 3000
        resources:
          requests:
            memory: "128Mi"
            cpu: "100m"
          limits:
            memory: "256Mi"
            cpu: "200m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: app-service
spec:
  selector:
    app: myapp
  ports:
  - port: 80
    targetPort: 3000
  type: LoadBalancer
```

## Success Criteria
- ✓ Images < 500MB
- ✓ Build time < 5min
- ✓ Zero-downtime deployments
- ✓ Auto-scaling configured
- ✓ Monitoring and logging

