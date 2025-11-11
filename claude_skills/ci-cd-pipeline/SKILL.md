---
name: ci-cd-pipeline
description: Expert in CI/CD pipeline design and implementation using GitHub Actions, GitLab CI, Jenkins, and other tools. Use when setting up automated testing, deployment pipelines, or DevOps workflows.
allowed-tools: Read, Write, Edit, Grep, Glob, Bash
---

# CI/CD Pipeline Expert

## Purpose
Design and implement automated CI/CD pipelines for testing, building, and deploying applications.

## Capabilities
- GitHub Actions, GitLab CI, Jenkins
- Automated testing in CI
- Build and artifact management
- Multi-environment deployments
- Blue-green and canary deployments
- Rollback strategies
- Secret management in CI/CD
- Pipeline monitoring and notifications

## GitHub Actions Example
```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

env:
  NODE_VERSION: '18'
  REGISTRY: ghcr.io

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run linter
        run: npm run lint
      
      - name: Run tests
        run: npm test -- --coverage
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
      
      - name: Build
        run: npm run build

  security-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Run Snyk
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
      
      - name: Run npm audit
        run: npm audit --audit-level=high

  build-and-push:
    needs: [test, security-scan]
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v2
      
      - name: Login to Registry
        uses: docker/login-action@v2
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}
      
      - name: Extract metadata
        id: meta
        uses: docker/metadata-action@v4
        with:
          images: ${{ env.REGISTRY }}/${{ github.repository }}
          tags: |
            type=sha,prefix={{branch}}-
            type=ref,event=branch
            type=semver,pattern={{version}}
      
      - name: Build and push
        uses: docker/build-push-action@v4
        with:
          context: .
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

  deploy:
    needs: build-and-push
    runs-on: ubuntu-latest
    environment: production
    
    steps:
      - name: Deploy to Kubernetes
        uses: azure/k8s-deploy@v4
        with:
          manifests: |
            k8s/deployment.yaml
            k8s/service.yaml
          images: |
            ${{ env.REGISTRY }}/${{ github.repository }}:${{ github.sha }}
      
      - name: Verify deployment
        run: |
          kubectl rollout status deployment/myapp
          kubectl get pods
```

## Success Criteria
- ✓ Pipeline runs < 10min
- ✓ Automated tests pass
- ✓ Security scans pass
- ✓ Zero-downtime deployments
- ✓ Rollback capability
- ✓ Notifications on failure

